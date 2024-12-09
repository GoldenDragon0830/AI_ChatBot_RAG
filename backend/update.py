import os
import re
import json
import openai
from flask import Flask, request, Response, stream_with_context
from dotenv import load_dotenv
from flask_cors import CORS

from pinecone import Pinecone
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain_openai import OpenAIEmbeddings
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain_pinecone import PineconeVectorStore
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.llm import LLMChain
from langchain.chains.conversation.base import ConversationChain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableBranch
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.chat_message_histories import ChatMessageHistory

load_dotenv()

# Load environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
PINECONE_NAMESPACE = os.getenv("PINECONE_NAMESPACE")
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME")
PORT = os.getenv("PORT")

# Define constants for flags
KEY_SELECT_PRODUCT = "SELECT_PRODUCT"
KEY_ASK_AMOUNT = "ASK_AMOUNT"
KEY_RETURN_PRICE = "RETURN_PRICE"
KEY_END_ORDER = "END_ORDER"
KEY_CHAT_CUSTOMER = "CHAT_CUSTOMER"
KEY_ANSWER_AMOUNT = "ANSWER_AMOUNT"

app = Flask(__name__)
app.config["CORS_HEADERS"] = "Content-Type"
CORS(app, supports_credentials=True, origins="*")

def get_openai_response(prompt, message):
    """Helper function to get a response from OpenAI."""
    response = openai.chat.completions.create(
        model=OPENAI_MODEL_NAME,
        messages=[{"role": "user", "content": f'{prompt}, Message {message}'}],
        max_tokens=200
    )
    return response.choices[0].message.content.strip()

def get_detect_result(record: str, keywords: str):
    """Detect relevant titles from a message and record."""

    # Condense the client’s requirement into a single, concise concept. For instance, convert “I want frozen pizza” into “Frozen pizza,” recognizing “frozen” as an adjective and “pizza” as a noun.
    #     When a phrase contains two nouns, such as “corn flakes,” include titles that contain either “corn” or “flakes”. so If record contain any one of noun then include title into array.
    #     Prioritize the semantic relevance of the requirement. Exclude titles that are unrelated to the core request, such as excluding “apple juice” for a request like “I want an apple.”
    summary_prompt = """
        Task: Create a structured JSON object from a list of titles extracted from the provided chunk data, related to specific keywords.

        Instructions:
        1. Data Extraction:
            Use the 'title' field from the provided chunk data for each document.
            Ensure all extracted titles are unique and directly sourced from the chunk data.

        2. Keyword Relevance:
            Each keyword should have a minimum of 8 titles. Only use the keywords provided, and ensure each title has some relevance to the keyword. But add as much as you can.

        3. JSON Structure:
            Organize the titles into a JSON object where each keyword is a key with an associated array of titles.

        4. Output Format:
            Return the output as a complete JSON object.
            Ensure the JSON is properly formatted and complete, so it can be parsed without errors.
            Example:

            {"keyword1": ["title1", "title2", "title3", ...]}

        Additional Considerations:
            Avoid any trailing commas in the JSON structure.
            Double-check the JSON syntax to ensure there are no missing brackets or incomplete entries.
            Do not create new titles; use only the 'title' data from the chunk data.
    """

    summary_response = openai.chat.completions.create(
        model=OPENAI_MODEL_NAME,
        messages=[
            {
                "role": "system", 
                "content": f'{summary_prompt}' 
            },
            {
                "role": "user",
                "content": f'Records : {record}, Keyword: {keywords}'
            }
        ],
        max_tokens=1000
    )

    response = summary_response.choices[0].message.content.strip()
    print(response)

    pattern = r'"([^"]+)": \[(.*?)\]'

    # Find all matches
    matches = re.findall(pattern, response, re.DOTALL)

    # Convert matches to a dictionary
    data = {}
    for key, values in matches:
        # Use regex to correctly split items inside the quotes
        items = re.findall(r'"(.*?)"', values, re.DOTALL)
        data[key] = items

    print("Convert JSON:", data)
    return data

def get_keyword_array(message: str):

    """Extract keywords from a message."""
    summary_prompt = """
        Extract keywords from the provided message while treating multi-word phrases as single keywords. Only split on the words 'and', ',', and similar delimiters.
        Output format: ['keyword1', 'keyword2', 'keyword3', …]
    """
    summary_response = openai.chat.completions.create(
        model=OPENAI_MODEL_NAME,
        messages=[
            {
                "role": "system", 
                "content": summary_prompt
            },
            {
                "role": "user",
                "content": message
            }
        ],
        max_tokens=200
    )
    response = summary_response.choices[0].message.content.strip()
    print("response", response)

    match = re.search(r"\[(.*?)\]", response)

    # If the match is found, process it
    if match:
        # Extract the matched content
        content = match.group(1)
        
        # Split the content by comma and strip whitespace and quotes
        keywords_list = [item.strip().strip("'\"") for item in content.split(",")]

        print(keywords_list)  # Output: ['keyword1', 'keyword2', 'keyword3']
        return keywords_list
    else:
        print("No valid list found in the input string.")
        return []


def parse_product_data(page_content):
    """Parse the product data from the page content."""
    product_data = {}
    for line in page_content.split('\n'):
        if line.strip():
            key, value = line.split(': ', 1)
            product_data[key.strip()] = value.strip()
    return product_data

def get_response(message: str, flag: str):
    """Generate a response based on the message and flag."""
    print(message)
    
    if flag == KEY_SELECT_PRODUCT:
        keywords = get_keyword_array(message)
        print("KEYWORDS: ",keywords)

        # top_k = len(keywords) * 15
        # if top_k > 45: 
        #     top_k = 45
        top_k = 15
        print("TOP_K", top_k)

        chat = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL_NAME,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )
        
        pc = Pinecone(api_key=PINECONE_KEY)
        index = pc.Index(PINECONE_INDEX)

        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

        vectorstore = PineconeVectorStore(
            pinecone_api_key=PINECONE_KEY, 
            index_name=PINECONE_INDEX, 
            embedding=embeddings,
            namespace=PINECONE_NAMESPACE
        )
        retriever = vectorstore.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={'score_threshold': 0.8, 'k': top_k}
        )

        SYSTEM_TEMPLATE = """
            You are an order assistant, an automated service for Instacart. Your duties include:
            you should suggest options using the menu so that customer could choose one.
            Response must be 1 sentence. Do not make long.

            The menu includes the following:
            <context>
            {context}
            </context>
        """

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_TEMPLATE),
                MessagesPlaceholder(variable_name="messages"),
            ]
        )

        document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

        query_transform_prompt = ChatPromptTemplate.from_messages(  
            [
                MessagesPlaceholder(variable_name="messages"),
                (
                    "user",
                    """
                        Given the above conversation, generate a search query to look up in order to get information relevant 
                        to the conversation. Only respond with the query, nothing else.
                    """
                ),
            ]
        )

        query_transforming_retriever_chain = RunnableBranch(
            (
                lambda x: len(x.get("messages", [])) == 1,
                (lambda x: x["messages"][-1].content) | retriever,
            ),
            query_transform_prompt | chat | StrOutputParser() | retriever,
        ).with_config(run_name="chat_retriever_chain")

        conversational_retrieval_chain = RunnablePassthrough.assign(
            context=query_transforming_retriever_chain,
        ).assign(
            answer=document_chain,
        )

        all_content = ""
        keyword_chunks = {}

        answer_sent = False

        for keyword in keywords:
            
            stream = conversational_retrieval_chain.stream(
                {
                    "messages": [
                        HumanMessage(content=keyword),
                    ]
                },
            )
            for chunk in stream:
                for key in chunk:
                    if key == "answer":
                        all_content += chunk[key]

                    elif key == "context":
                        # Obtain the title list from get_detect_result function
                        # print(chunk[key])
                        title_list = get_detect_result(chunk[key], keyword)

                        print(title_list)
                        # Dynamically populate keyword_chunks based on returned title_list keys
                        if keyword not in keyword_chunks:
                            keyword_chunks[keyword] = []
                        
                        # Iterate over the documents in the context chunk
                        for document in chunk[key]:
                            text_field = document.page_content
                            title_match = re.search(r"title: (.+)", text_field)
                            title_content = title_match.group(1).strip() if title_match else ""
                            
                            if title_content in title_list.get(keyword, []):
                                print("------->",title_content)
                                product_data = parse_product_data(text_field)
                                keyword_chunks[keyword].append(product_data)

            if answer_sent == False:
                yield f'data: {all_content}\n\n'
                answer_sent = True

            # Convert the dictionary to a JSON string for the desired format
            yield f'data: ChunkData:{json.dumps(keyword_chunks)}\n\n'
        
        
        answer_sent = False
        yield f'data: OPTION_END\n\n'

    elif flag == KEY_ASK_AMOUNT:
        PROMPT = """
            You should ask the customer how many products they want for this product {message} kindly for calculating total price.
            Response must be 1 sentence. Do not make long.
        """
        response = get_openai_response(PROMPT, message)
        yield f'data: {KEY_ASK_AMOUNT}:{response}\n\n'
    
    elif flag == KEY_CHAT_CUSTOMER:
        PROMPT = """
            Give conversation with customer kindly. 
            Customer wants to order again, ask the customer like this: what would you like to order today?
            Make response only one sentence. Do not make over 2 sentences.
        """
        response = get_openai_response(PROMPT, message)
        yield f'data: {response}\n\n'  

    elif flag == KEY_ANSWER_AMOUNT:
        PROMPT = """
            Please enter the amount of products or a related quantity. Provide your input in any format, such as ‘5 apples’, ‘Quantity: 10’, or ‘There are 15 items’. I will extract and return only the numerical value from your input.
            Note: Only return number. Valid Output : Number 
        """
        response = openai.chat.completions.create(
            model=OPENAI_MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": PROMPT
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=200
        ).choices[0].message.content.strip()

        yield f'data: {KEY_ANSWER_AMOUNT}:{response}\n\n'

@app.route("/chat")
def sse_request():
    """Handle chat requests."""
    message = request.args.get('message', '')
    flag = request.args.get('flag', '')
    return Response(stream_with_context(get_response(message, flag)), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)

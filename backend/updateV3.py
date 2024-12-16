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
from sqlalchemy import text
from flaskext.mysql import MySQL

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
mysql = MySQL()
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = 'csv'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)
CORS(app, supports_credentials=True, origins="*")

conn = mysql.connect()
cursor =conn.cursor()

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
    summary_prompt = """
        Your task is to identify and extract the corresponding value from a predefined dataset based on a provided keyword. This keyword may relate to one of three fields: "type", "name", or "option_keyword".

        Instructions:

            Input: A single keyword is provided by the user.
            Detection Process:
            Type Field Matching:
                Evaluate whether the keyword matches any entry in the “type” field.
                If a match is found, include the result in the format ["type", "value"] in the output, where “value” is the exact match from the dataset.
                If no exact match is found, identify the most similar entry in the "type" field and include it in the output as ["type", "value"].
                If the keyword is completely unrelated to any previous input, default to identifying it as a "type".
            Name Field Matching:
                Check if the keyword matches any entry in the “name” field.
                If a match is found, include the result in the format ["name", "value"] in the output.
            Option_Keyword Field Matching:
                Check if the keyword matches any entry in the “option_keyword” field.
                If a match is found, include the result in the format ["option_keyword", "value"] in the output.
            Output:
                Provide all detected fields and their corresponding values from the dataset in the format {["field", "value"], ["field", "value"], ...}.
                Ensure that each “value” is an exact entry from the dataset records or the most similar entry for the "type" field.
                Return only the resulting field and value pairs without additional explanations or text.
        Guidelines:
            Prioritize precision by ensuring the returned values are directly sourced from the dataset.
            If no matches are found in the "name" or "option_keyword" fields, identify the most similar entry in the "type" field and include it in the output.
            Recognize the input as a single keyword unless it is a specific value related to previous conversation history.
            The output should be concise and formatted for seamless integration into system processes.
            Include all matching field and value sets to provide a comprehensive result.
            Ensure there is at least one array in the output, prioritizing the "type" field if necessary.
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
                "content": f'Menu : {record}, Input: {keywords}'
            }
        ],
        max_tokens=1000
    )

    response = summary_response.choices[0].message.content.strip()
    print(response)

    pattern = r'\["([^"]+)",\s*"([^"]+)"\]'
    matches = re.findall(pattern, response)

    field_value_array = [list(match) for match in matches]
    
    return field_value_array

    # try:
    #     # Parse the response as JSON
    #     field_value_array = json.loads(response)
    #     print("Converted JSON Array:", field_value_array)
    # except json.JSONDecodeError:
    #     print("Failed to parse JSON from the response.")
    #     field_value_array = []
    
    # return field_value_array

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
        # keywords = get_keyword_array(message)
        # print("KEYWORDS: ",keywords)

        # top_k = len(keywords) * 15
        # if top_k > 45: 
        #     top_k = 45
        top_k = 10
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
        retriever = vectorstore.as_retriever(
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

        # for keyword in keywords:
            
        stream = conversational_retrieval_chain.stream(
            {
                "messages": [
                    HumanMessage(content=message),
                ]
            },
        )

        results_data = {}
        
        for chunk in stream:
            for key in chunk:
                if key == "answer":
                    all_content += chunk[key]
                    
                elif key == "context":
                    # Obtain the title list from get_detect_result function
                    # print(chunk[key])
                    title_list = get_detect_result(chunk[key], message)
                    print("AI detect result: ", title_list)
                    
                    where_clauses = []
                    result_key = ""
                    detect_type = ""
                    detect_value = ""

                    has_option_keyword = False
                    has_name = False

                    for item in title_list:

                        field_type, field_value = item
                        if field_type == "type":
                            where_clauses.append(f"type='{field_value}'")
                            detect_type = "type"
                            detect_value = field_value
                        elif field_type == "name":
                            where_clauses.append(f"name='{field_value}'")
                            has_name = True
                            detect_type = "name"
                            detect_value = field_value
                        elif field_type == "option_keyword":
                            where_clauses.append(f"option_keyword='{field_value}'")
                            has_option_keyword = True
                            detect_type = "option_keyword"
                            detect_value = field_value

                    if has_option_keyword:
                        result_key = "option_name"
                    elif has_name:
                        result_key = "option_keyword"
                    else:
                        result_key = "name"
                        

                    where_clauses = " AND ".join(where_clauses)
                    if result_key == "option_name":
                        query = f"SELECT DISTINCT * FROM csv WHERE {where_clauses}"
                    else:
                        query = f"SELECT DISTINCT {result_key} FROM csv WHERE {where_clauses}"

                    print(query)

                    cursor.execute(query)
                    results = cursor.fetchall()
                    print(results)

                    column_names = ["id", "category", "name", "price", "discount", "size", "option_name", "stock"]

                    # Format results for streaming
                    if result_key == "option_name":
                        results_data = [{result_key: f'{dict(zip(column_names, row))}'} for row in results]
                    else:
                        results_data = [{result_key : row[0]} for row in results]

                    print("Query Results:", results_data)

        # Convert the dictionary to a JSON string for the desired format
        # yield f'data: ChunkData:{json.dumps(keyword_chunks)}\n\n'
        
        yield f'data: {all_content}\n\n'

        yield f'data: TYPE:{detect_type}@{detect_value}\n\n'        

        yield f'data: ChunkData:{json.dumps(results_data)}\n\n'
        # answer_sent = False

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

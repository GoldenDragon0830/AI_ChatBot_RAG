import os
import re
import json
from flask import Flask, request, Response, stream_with_context
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin

from pinecone import Pinecone

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain_openai import OpenAIEmbeddings
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain_pinecone import PineconeVectorStore
# from langchain.text_splitter import RecursiveCharacterTextSplitter
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

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_ENV = os.environ.get("PINECONE_ENV")
PINECONE_INDEX = os.environ.get("PINECONE_INDEX")
PINECONE_NAMESPACE = os.environ.get("PINECONE_NAMESPACE")
OPENAI_MODEL_NAME = os.environ.get("OPENAI_MODEL_NAME")

app = Flask(__name__)
app.config["CORS_HEADERS"] = "Content-Type"

# CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, supports_credentials=True, origins="*")


def get_title_from_content(content: str) -> str:
    keyword = ChatOpenAI(
        openai_api_key=OPENAI_API_KEY,
        model=OPENAI_MODEL_NAME,
        max_tokens=50
    )
    # Define the prompt to extract the title
    prompt = f"Generate all options that customer can choose based on the content. Please give me words like this format. '@option@option etc' Just give me keywords and do not include other words, mark, space and another description. MIN 2 and more. {content}"
    
    # Create a prompt template
    title_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "user",
                prompt,
            ),
        ]
    )
    
    # Run the prompt through the chat model
    response = title_prompt | keyword
    result = response.invoke({})

    # # Split the text into individual keywords
    # keywords = result.content.split('@')
    # # Add '#abc' to each keyword
    # modified_keywords = [keyword + get_image_url_from_content(keyword) for keyword in keywords]
    # # Join the modified keywords back into a string
    # modified_result = '@'.join(modified_keywords)
    # return modified_result
    return result.content

    

def get_response(prefix: str, message: str, isFirst: bool):
    print(f'## CLIENT ----------> {message}')
    chat = ChatOpenAI(
        openai_api_key=OPENAI_API_KEY,
        model=OPENAI_MODEL_NAME,
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()],
    )

    pc = Pinecone(api_key=PINECONE_KEY)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    index = pc.describe_index(PINECONE_INDEX)
    vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                      namespace=PINECONE_NAMESPACE)
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={'k':20, 'lambda_mult': 0.25, 'score_threshold': 0.9}
    )
    # docs = retriever.invoke(message)
    # Last prompt
    # You are order make assistant.
    # Our goal is to make an Order based on the info from customer. 
    # Answer the user's questions based on the below context. Answer base on the only given theme. Start a natural seeming conversation.
    # you should get some detail info what customer want exactly. so finally you should show order info to customer.

    # Do not make long response, response should be short for 1 sentence.
    SYSTEM_TEMPLATE = """
        You are an order assistant, an automated service for Instacart. Your duties include:

        1. Greeting the customer and collecting their order.
        2. Confirming whether the order is for pickup or delivery.
        3. Waiting until the entire order has been gathered, then summarizing it and checking one final time if the customer wants to add anything else.
        4. After the final check, adding ##NoOption## to the end of every response for easy identification.
        5. If the order is for delivery, asking for the customer's address and contact phone number.
        6. Collecting payment details.
        7. Ensuring all options, extras, and sizes of items are clarified for accurate identification from the menu.
        8. Responding in a short, conversational, and friendly style.

        You can use some emoticons related food and drink etc..
        The menu includes the following:
        <context>
        {context}
        </context>

        After the customer has completed their order, you should create a structured summary that includes:
        1. Title (including subtitle and category)
        2. Single price * counts
        3. Delivery address (if applicable)
        4. Contact phone number
        5. Total price

        Once the order is finalized, kindly ask the customer if they would like to place the order again. If they answer affirmatively, remove the ##NoOption## tag from all responses and restart the ordering process. If not. leave kindly message.
    """

    question_answering_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                SYSTEM_TEMPLATE,
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

    query_transform_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="messages"),
            (
                "user",
                "Given the above conversation, generate a search query to look up in order to get information relevant "
                "to the conversation. Only respond with the query, nothing else.",
            ),
        ]
    )

    query_transforming_retriever_chain = RunnableBranch(
        (
            lambda x: len(x.get("messages", [])) == 1,
            # If only one message, then we just pass that message's content to retriever
            (lambda x: x["messages"][-1].content) | retriever,
        ),
        # If messages, then we pass inputs to LLM chain to transform the query, then pass to retriever
        query_transform_prompt | chat | StrOutputParser() | retriever,
    ).with_config(run_name="chat_retriever_chain")

    conversational_retrieval_chain = RunnablePassthrough.assign(
        context=query_transforming_retriever_chain,
    ).assign(
        answer=document_chain,
    )
    stream = conversational_retrieval_chain.stream(
        {
            "messages": [
                HumanMessage(content=message),
            ],
        }
    )

    all_content = ""
    all_chunks = []
    for chunk in stream:
        for key in chunk:
            if key == "answer":
                all_content += chunk[key]
                yield f'data: {chunk[key]}\n\n'
            elif key == "context":
                for document in chunk[key]:
                    text_field = document.page_content
                    # Extract title from the page_content
                    title_match = re.search(r"title: (.+)", document.page_content)
                    title = title_match.group(1).strip() if title_match else ""

                    # Extract image URL from the page_content
                    image_urls_line = next((line for line in text_field.splitlines() if line.startswith("image_urls:")), None)
                    image_url = image_urls_line.replace("image_urls: ", "").split(", ")[0] if image_urls_line else ""

                    # Append the title and image URL as a dictionary to the list
                    all_chunks.append({
                        "title": title.split(", ")[0],
                        "imageUrl": image_url
                    })

        
    print(f'$$ AI_AGENT --------> {all_chunks}')
    # SummaryTitle = get_title_from_content(all_content)    
    # yield f'data: SummaryTitle:{SummaryTitle}\n\n'
    yield f'data: ChunkData:{json.dumps(all_chunks)}\n\n'


@app.route("/chat")
#@cross_origin()
def sse_request():
    
    prefix = request.args.get('prefix', '')
    message = request.args.get('message', '')
    return Response(stream_with_context(get_response(prefix, message)), content_type='text/event-stream')

# @app.route("/image-url")
# def image_url():
#     message = request.args.get('message', '')
#     return Response(stream_with_context(get_image_url_from_content(message)), content_type='text/event-stream')

@app.route("/feedback", methods=["POST"])
@cross_origin()
def feedback():
    body = request.json

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful assistant. Answer to the best of your ability.",
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Analyzes the following conversation and provides possible feedback, such as grammar or "
                "spelling errors, all about the HumanMessage. Respond using markdown."
            ),
        ]
    )

    chat = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model_name=OPENAI_MODEL_NAME)

    chat_history = ChatMessageHistory()
    for item in body["chat_history"]:
        if item["who"] == "ai":
            chat_history.add_ai_message(item["text"])
        else:
            chat_history.add_user_message(item["text"])

    chain = prompt | chat

    response = chain.invoke(
        {
            "chat_history": chat_history.messages,
        }
    )

    return response.content

@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=80)

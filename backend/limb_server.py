import os
import re
import json
import openai
import psycopg2
from flask import jsonify
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

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "csv")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

app = Flask(__name__)
app.config["CORS_HEADERS"] = "Content-Type"
CORS(app, supports_credentials=True, origins="*")

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=POSTGRES_DB,
    user=POSTGRES_USER,
    password=POSTGRES_PASSWORD,
    host=POSTGRES_HOST,
    port=POSTGRES_PORT,
)
cursor = conn.cursor()
print("Connected to PostgreSQL database successfully!")

def get_openai_response(prompt, message):
    """Helper function to get a response from OpenAI."""
    response = openai.chat.completions.create(
        model=OPENAI_MODEL_NAME,
        messages=[{"role": "user", "content": f'{prompt}, Message {message}'}],
        max_tokens=1000
    )
    return response.choices[0].message.content.strip()

def parse_product_data(page_content):
    """Parse the product data from the page content."""
    product_data = {}
    current_key = None
    current_value = []

    for line in page_content.split('\n'):
        if ': ' in line:
            if current_key:
                # Join accumulated lines for the previous key as a single string
                product_data[current_key] = '\n'.join(current_value).strip()
            # Start new key-value pair
            current_key, value = line.split(': ', 1)
            current_value = [value.strip()]
        elif current_key:
            # Continue accumulating lines for the current key
            current_value.append(line.strip())

    # Add the last key-value pair if it exists
    if current_key:
        product_data[current_key] = '\n'.join(current_value).strip()

    return product_data

def get_db_response(category, type, subcategory):
    result_data = []
    query = ""
    
    # Ensure category and type are properly formatted for SQL
    category = f"('{category}')" if isinstance(category, str) else category
    type = f"('{type}')" if isinstance(type, str) else type

    if not subcategory:  # Check if subcategory is empty or None
        query = f'SELECT * FROM "limblengthening" WHERE "category" IN {category} AND "type" IN {type}'
    else:
        query = f'SELECT * FROM "limblengthening" WHERE "category" IN {category} AND "type" IN {type} AND "subcategory" IN ({subcategory})'

    print(query)
    try:
        cursor.execute(query)
        results = cursor.fetchall()

        print("123123123",results)

        result_data = [
            {
                "category": row[1],
                "type": row[2],
                "content": row[3]
            }
            for row in results
        ]
    except psycopg2.Error as e:
        print(f"Error executing query: {e}")
        result_data = []

    return result_data

def get_response(prefix: str, message: str):
    print(f'## CLIENT ----------> {message}')
    chat = ChatOpenAI(
        openai_api_key=OPENAI_API_KEY,
        model=OPENAI_MODEL_NAME,
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()]
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
        search_kwargs={'score_threshold': 0.8, 'k': 20}
    )

    SYSTEM_TEMPLATE = """
        You are Medical Assistant for Limb Lengthening. Based on this 
        <context>
        {context}
        </context> 
        data, provide some advice for user's request. and return response using HTML tag.
        Note: add one or two images and one video link, for video, you can use iframe tag and you can img tab for image. only return one video and one or two image at least.
              And Images and video should display as same line as vertical.
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
        
    stream = conversational_retrieval_chain.stream(
        {
            "messages": [
                HumanMessage(content=message),
            ]
        },
    )

    def parse_page_content(page_content):
        # Extract fields from the YAML-like string
        # Handles both quoted and unquoted values, and ignores leading BOM or whitespace
        fields = {}
        for line in page_content.splitlines():
            line = line.strip('\ufeff').strip()
            if ':' in line:
                key, value = line.split(':', 1)
                fields[key.strip()] = value.strip()
        return fields

    video_chunk = None
    image_chunk = None

    for chunk in stream:
        for key in chunk:
            if key == "answer":
                all_content += chunk[key]
    yield f'data: {all_content}\n\n'

@app.route("/chat")
def sse_request():
    """Handle chat requests."""
    message = request.args.get('message', '')
    flag = request.args.get('flag', '')
    return Response(get_response(flag, message))

@app.route("/get_db_response")
def db_request():
    category = request.args.get('category', '')
    type = request.args.get('type', '')
    subcategory = request.args.get('subcategory', '')
    
    result_data = get_db_response(category=category, type=type, subcategory=subcategory)

    return jsonify(result_data)
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)
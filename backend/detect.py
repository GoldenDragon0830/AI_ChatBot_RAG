import os
import re
import json
import openai
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

# Flag
KEY_SELECT_PRODUCT = "SELECT_PRODUCT"
KEY_SELECT_OPTION = "SELECT_OPTION"
KEY_CONTINUE = "CONTINUE"
KEY_END_ORDER = "END_ORDER"



app = Flask(__name__)
app.config["CORS_HEADERS"] = "Content-Type"

# CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, supports_credentials=True, origins="*")
    

def get_detect_keyword(message: str):
    print(f'## CLIENT ----------> {message}')

    # Define the prompt to extract the title
    system_prompt = """
        As a product order system, analyze the user input and categorize it into one of the following intents:

        1. "make_new_order": Detect if the user is:
        - Requesting a new product (e.g., "need sth")
        - Asking about ordering new items with specific products mentioned
        - Inquiring about new product availability with specific details
        - Mentioning a specific product or type of food
        - Adding the last product to the cart
        - Asking about another product after discussing amounts

        2. "order_detail": Detect if the user is:
        - When indicating the quantity or number of a product or presenting a value expressed as a number
        - When the previous conversation asked about the quantity of a product
        - Except when the value is very high or has no meaning.

        4. "chat_with_customer": Detect if the user is:
        - Saying a greeting (e.g., "I'm Instacart Order Assistant")
        - Asking questions not directly related to placing an order, such as how to make an order
        - Requesting detailed information about a product or the ordering process

        5. "other_intent": Default category for any input that doesn't clearly match the above categories

        Instructions:
            1. Analyze the input carefully to categorize it into one of these five intents.
            2. If there's any mention of greetings, questions about the ordering process, non-order-related questions, or requests for product details, prioritize "chat_with_customer."
            3. If there's any mention of specific product requests, prioritize "make_new_order."
            4. If there's any indication of choosing a product or setting the amount again, prioritize "ask_amount."
            5. If the input includes an amount of a product explicitly prefixed with "@AMOUNT:", prioritize "order_detail."
            6. When in doubt, or if the intent is unclear, return "other_intent."

        Return only one intent as a lowercase string.
        Valid outputs are: make_new_order, ask_amount, order_detail, chat_with_customer, other_intent

        User Input: {message}
    """
    
    # Create a prompt template
    summary_response = openai.chat.completions.create(
        model=OPENAI_MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt}
        ],
        max_tokens=200
    )
    summary_title = summary_response.choices[0].message.content.strip()
    print(summary_title)
    return summary_title

def get_new_response(prefix: str, message: str, flag: str):
    keyword = get_detect_keyword(message);

    print(f'Keyword ---------------------------------> {keyword}')

    if keyword in "other_intent":

        # Define the prompt to extract the title
        system_prompt = """
            if customer ask or answer as unclear response. then you should ask or answer again kindly.
            if you ask about amount, but he's response is useless. and not specific. so you can ask again before questions kindly.
            If you can't understand about customer's answer. you should ask again kindly.
            response: {message} 
        """
        
        # Create a prompt template
        summary_response = openai.chat.completions.create(
            model=OPENAI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt}
            ],
            max_tokens=200
        )
        summary_title = summary_response.choices[0].message.content.strip()
        print(summary_title)
        yield f'data: ChatData:{summary_title}\n\n'

    if keyword in "chat_with_customer":
        chat = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL_NAME,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )

        pc = Pinecone(api_key=PINECONE_KEY)
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                        namespace=PINECONE_NAMESPACE)
        
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 1, 'lambda_mult': 0.25, 'score_threshold': 0.99}
        )

        SYSTEM_TEMPLATE = """
            You are order make assistant. you can answer for customer 
            - greeting word.
            - kindly and super support to guide.
            - answer for the several question

            Response should a little simple. not over 1~2 sentences.

            If customer want to know about detail info for some specific product. you can use this:
            <context>
            {context}
            </context>
        """

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SYSTEM_TEMPLATE # .format(flag=flag, KEY_CONTINUE=KEY_CONTINUE, KEY_END_ORDER=KEY_END_ORDER),
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
                    "Given the above conversation, you can chat with customer kindly, greetings. etc.."
                    "If customer want to know about detail info for some specific product, answer kindly and smartly",
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

    if keyword in "make_new_order":
        chat = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL_NAME,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )

        pc = Pinecone(api_key=PINECONE_KEY)
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                        namespace=PINECONE_NAMESPACE)
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 10, 'lambda_mult': 0.25, 'score_threshold': 0.99}
        )

        SYSTEM_TEMPLATE = """
            you are order assistant and should ask to customer what he want of these smiliar products.

            The menu includes the following:
            <context>
            {context}
            </context>
        """

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SYSTEM_TEMPLATE # .format(flag=flag, KEY_CONTINUE=KEY_CONTINUE, KEY_END_ORDER=KEY_END_ORDER),
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
                (lambda x: x["messages"][-1].content) | retriever,
            ),
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
                        product_data = parse_product_data(text_field)
                        all_chunks.append(product_data)
        
        yield f'data: ChunkData:{json.dumps(all_chunks)}\n\n'

    if keyword in "ask_amount":
        chat = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL_NAME,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )

        pc = Pinecone(api_key=PINECONE_KEY)
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                        namespace=PINECONE_NAMESPACE)
        
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 1, 'lambda_mult': 0.25, 'score_threshold': 0.99}
        )

        SYSTEM_TEMPLATE = """
            You should ask to customer how many products want. some kind of products have different unit and you can get info from this: 
            <context>
            {context}
            </context>
        """

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SYSTEM_TEMPLATE # .format(flag=flag, KEY_CONTINUE=KEY_CONTINUE, KEY_END_ORDER=KEY_END_ORDER),
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
                    "Given the above conversation, Ask to customer kindly 'how much do you want'",
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

        #         elif key == "context":
        #             for document in chunk[key]:
        #                 text_field = document.page_content
        #                 product_data = parse_product_data(text_field)
        #                 all_chunks.append(product_data)

        # yield f'data: {KEY_SELECT_OPTION}:{json.dumps(all_chunks)}\n\n'
        # yield f'data: @AMOUNT:{all_content}\n\n'

    if keyword in "order_detail":
        chat = ChatOpenAI(
            openai_api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL_NAME,
            streaming=True,
            callbacks=[StreamingStdOutCallbackHandler()],
        )

        pc = Pinecone(api_key=PINECONE_KEY)
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                        namespace=PINECONE_NAMESPACE)
        
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 1, 'lambda_mult': 0.25, 'score_threshold': 0.9}
        )

        SYSTEM_TEMPLATE = """
            Customer would answer the amounts for last product then you should return for total price using US $ follow this style @AMOUNT:$(total price) like this @AMOUNT:$100
            Note: Only show total price follow style. do not include other sentences, words etc.

            you can get detail info from this:
            <context>
            {context}
            </context>
        """

        question_answering_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    SYSTEM_TEMPLATE # .format(flag=flag, KEY_CONTINUE=KEY_CONTINUE, KEY_END_ORDER=KEY_END_ORDER),
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
                    "Customer would answer the amounts for last product then you should return for total price using US $ follow this style @AMOUNT:$(total price) like this @AMOUNT:$100"
                    "Note: Only show total price follow style. do not include other sentences, words etc.",
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

        #         elif key == "context":
        #             for document in chunk[key]:
        #                 text_field = document.page_content
        #                 product_data = parse_product_data(text_field)
        #                 all_chunks.append(product_data)

        # yield f'data: {KEY_SELECT_OPTION}:{json.dumps(all_chunks)}\n\n'
        # yield f'data: @AMOUNT:{all_content}\n\n'


def get_response(prefix: str, message: str, flag: str):
    print(f'## CLIENT ----------> {message}')

    chat = ChatOpenAI(
        openai_api_key=OPENAI_API_KEY,
        model=OPENAI_MODEL_NAME,
        streaming=True,
        callbacks=[StreamingStdOutCallbackHandler()],
    )

    pc = Pinecone(api_key=PINECONE_KEY)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                    namespace=PINECONE_NAMESPACE)
    if flag in [KEY_SELECT_PRODUCT, KEY_END_ORDER, KEY_CONTINUE]:
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 10, 'lambda_mult': 0.25, 'score_threshold': 0.99}
        )
    elif flag == KEY_SELECT_OPTION:
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={'k': 1, 'lambda_mult': 0.25, 'score_threshold': 0.9}
        )

    SYSTEM_TEMPLATE = """
        You are an order assistant, an automated service for Instacart. Your duties include:

        1. Greeting the customer and collecting their order.
        2. Confirming whether the order is for pickup or delivery.
        3. Waiting until the entire order has been gathered, then summarizing it and checking one final time if the customer wants to add anything else.
        4. If the order is for delivery, asking for the customer's address and contact phone number.
        5. Collecting payment details.
        6. Ensuring all options, extras, and sizes of items are clarified for accurate identification from the menu.
        7. Responding in a short, conversational, and friendly style.

        Response should be 1 sentence. Do not make long.

        If you get specific product from response and should ask to customer how many he wants so that we can calculate total price.
        If customer answer the amounts for last product then return for total price using US $ follow this style @AMOUNT:$(total price) like this @AMOUNT:$100
        Note: Only show total price follow style. do not include other sentences, words etc.

        The menu includes the following:
        <context>
        {context}
        </context>
    """

        # if {flag} is {KEY_CONTINUE} then you should to try again because customer wants to order again.
        # if {flag} is {KEY_END_ORDER} then you should say goodbye kindly, in this case, customer wants to finish chat. Say more kindly.

    question_answering_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                SYSTEM_TEMPLATE # .format(flag=flag, KEY_CONTINUE=KEY_CONTINUE, KEY_END_ORDER=KEY_END_ORDER),
            ),
            MessagesPlaceholder(variable_name="messages"),
        ]
    )

    document_chain = create_stuff_documents_chain(chat, question_answering_prompt)


    if flag in [KEY_SELECT_PRODUCT, KEY_END_ORDER, KEY_CONTINUE]:
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
    elif flag == KEY_SELECT_OPTION:
        query_transform_prompt = ChatPromptTemplate.from_messages(
            [
                MessagesPlaceholder(variable_name="messages"),
                (
                    "user",
                    "Given the above conversation, generate a search query to look up in order to get information relevant "
                    "to the conversation. If customer answer the amounts for last product then return for total price using US $ like this style @AMOUNT:$(total price)"
                    "If answer amount again, return for total price like this style @AMOUNT:$(total price)"
                    "Note: Only show total price follow style. do not include other sentences, words etc.",
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
    stream = conversational_retrieval_chain.stream(
        {
            "messages": [
                HumanMessage(content=message),
            ],
        }
    )

    all_content = ""
    all_chunks = []
    if flag in [KEY_SELECT_PRODUCT, KEY_CONTINUE]:
        for chunk in stream:
            for key in chunk:
                if key == "answer":
                    all_content += chunk[key]
                    yield f'data: {chunk[key]}\n\n'
                elif key == "context":
                    for document in chunk[key]:
                        text_field = document.page_content
                        title_match = re.search(r"title: (.+)", document.page_content)
                        title = title_match.group(1).strip() if title_match else ""
                        image_urls_line = next((line for line in text_field.splitlines() if line.startswith("image_urls:")), None)
                        image_url = image_urls_line.replace("image_urls: ", "").split(", ")[0] if image_urls_line else ""
                        all_chunks.append({
                            "title": title.split(", ")[0],
                            "imageUrl": image_url
                        })
    
        yield f'data: ChunkData:{json.dumps(all_chunks)}\n\n'
    
    elif flag in KEY_SELECT_OPTION:
        for chunk in stream:
            for key in chunk:
                if key == "answer":
                    all_content += chunk[key]
                    yield f'data: {chunk[key]}\n\n'
                elif key == "context":
                    for document in chunk[key]:
                        text_field = document.page_content
                        product_data = parse_product_data(text_field)
                        all_chunks.append(product_data)

        if "@AMOUNT:" not in all_content:
            yield f'data: {KEY_SELECT_OPTION}:{json.dumps(all_chunks)}\n\n'
        else:
            yield f'data: @AMOUNT:{all_content}\n\n'
        

       

def parse_product_data(page_content):
    """Parse the product data from the page content."""
    lines = page_content.split('\n')
    product_data = {}
    for line in lines:
        if not line.strip():
            continue
        key, value = line.split(': ', 1)
        product_data[key.strip()] = value.strip()
    return product_data

@app.route("/chat")
#@cross_origin()
def sse_request():
    
    prefix = request.args.get('prefix', '')
    message = request.args.get('message', '')
    flag = request.args.get('flag', '')
    return Response(stream_with_context(get_new_response(prefix, message, flag)), content_type='text/event-stream')

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

from fastapi import FastAPI
from typing import Optional, AsyncGenerator, NoReturn, Dict, List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

import os
from dotenv import load_dotenv
import csv
import json
# import fitz
import requests
from pinecone import Pinecone
# import pandas as pd
import google.generativeai as genai
from requests.exceptions import ConnectionError

# from docx import Document
# from openpyxl import load_workbook
from io import BytesIO, StringIO

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain.chains.conversation.base import ConversationChain
from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain_openai import OpenAIEmbeddings
from langchain.callbacks import StreamingStdOutCallbackHandler
from langchain_pinecone import PineconeVectorStore
# from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableBranch
from langchain_core.messages import AIMessage, HumanMessage
from operator import itemgetter
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import (
    RunnableLambda,
    RunnableParallel,
    RunnablePassthrough,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_KEY = os.environ.get("PINECONE_KEY")
PINECONE_ENV = os.environ.get("PINECONE_ENV")
PINECONE_INDEX = os.environ.get("PINECONE_INDEX")
PINECONE_NAMESPACE = os.environ.get("PINECONE_NAMESPACE")
OPENAI_MODEL_NAME = os.environ.get("OPENAI_MODEL_NAME")
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
GEMINI_MODEL_NAME = os.environ.get("GEMINI_MODEL_NAME")
CLAUDE_MODEL_NAME = os.environ.get("CLAUDE_MODEL_NAME")
genai.configure(api_key=GOOGLE_API_KEY)


class Node(BaseModel):
    id: str = Field(
        ...,
        description="The name of object or service of the cybersecurity information source.",
    )


class Link(BaseModel):
    source: str = Field(
        ...,
        description="The name of object or service of the originating node in the dataflow.",
    )
    target: str = Field(
        ...,
        description="The name of object or service of the destination node in the dataflow.",
    )
    type: str = Field(
        ...,
        description="Type of relationship or interaction between the source and target nodes.",
    )


class quoted_answer(BaseModel):
    """A model representing a cybersecurity information flow, constructed from specified sources."""

    nodes: List[Node] = Field(
        ...,
        description="Collection of nodes representing sources of cybersecurity information.",
    )
    links: List[Link] = Field(
        ..., description="Collection of links defining relationships and interactions between nodes."
    )


def format_docs_with_id(docs: List[Document]) -> str:
    formatted = [
        f"Data Snippet: {doc.page_content}"
        for i, doc in enumerate(docs)
    ]
    return "\n\n" + "\n\n".join(formatted)


async def dataflow_json_generation(message: str):
    pc = Pinecone(api_key=PINECONE_KEY)
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    index = pc.describe_index(PINECONE_INDEX)
    vectorstore = PineconeVectorStore(pinecone_api_key=PINECONE_KEY, index_name=PINECONE_INDEX, embedding=embeddings,
                                      namespace=PINECONE_NAMESPACE)
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 5})

    # retrieved_docs = retriever.invoke(input="What is the role of digital forensics in cybersecurity?")

    llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model="gpt-4-turbo-preview", temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You're a helpful cybersecurity advisor. Given a user question and some security data snippets, "
                "answer the user question. If none of the articles answer the question, just say you don't know.\n\n"
                "Here are the security data:{context}",
            ),
            ("human", "{question}"),
        ]
    )

    output_parser_2 = JsonOutputKeyToolsParser(
        key_name="quoted_answer", first_tool_only=True
    )
    llm_with_tool_2 = llm.bind_tools(
        [quoted_answer],
        tool_choice="quoted_answer",
    )
    format_2 = itemgetter("docs") | RunnableLambda(format_docs_with_id)
    answer_2 = prompt | llm_with_tool_2 | output_parser_2
    chain_2 = (
        RunnableParallel(question=RunnablePassthrough(), docs=retriever)
        .assign(context=format_2)
        .assign(quoted_answer=answer_2)
        .pick(["quoted_answer", "docs"])
    )
    result = chain_2.invoke(message)
    for key in result:
        if key == "quoted_answer":
            return result[key]


@app.get("/")
async def root():
    result = await dataflow_json_generation("What is the role of digital forensics in cybersecurity?")
    return result


@app.get("/dataflow/{message}")
async def say_hello(message: str):
    result = await dataflow_json_generation(message)
    # print(result)
    content = {"data": result}
    return JSONResponse(content=content, status_code=200)
    # return {"message": f"Hello {name}"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=80,
        log_level="debug",
        reload=True,
    )

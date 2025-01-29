import os
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import time


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# PINECONE_KEY = os.environ.get("PINECONE_API_KEY")
# PINECONE_ENV = os.environ.get("PINECONE_ENV")
# PINECONE_INDEX = os.environ.get("PINECONE_INDEX")
# PINECONE_NAMESPACE = os.environ.get("PINECONE_NAMESPACE")
PINECONE_KEY="c1a80e49-2f48-4cb6-a5d3-3556d1813143"
PINECONE_ENV="us-east-1"
PINECONE_INDEX="westsidewoknew"
PINECONE_NAMESPACE="nyc"


if __name__ == "__main__":
    try:
        loader = CSVLoader(file_path="products.csv", encoding='utf-8')
        csv_data = loader.load()
    except FileNotFoundError:
        print("The file 'products.csv' was not found. Please ensure it is in the correct directory.")

    embeddings_model = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    # embeddings = embeddings_model.embed_documents(texts=csv_data)

    print(PINECONE_KEY)
    pc = Pinecone(api_key=PINECONE_KEY)

    index_name = PINECONE_INDEX
    namespace = PINECONE_NAMESPACE

    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        while not pc.describe_index(index_name).status["ready"]:
            time.sleep(1)

    index = pc.Index(index_name)

    # The OpenAI embedding model `text-embedding-ada-002 uses 1536 dimensions`
    docsearch = PineconeVectorStore.from_documents(
        csv_data,
        embeddings_model,
        index_name=index_name,
        namespace=namespace,
    )

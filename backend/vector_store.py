import os
import chromadb
from typing import List, Optional
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document
from utils import parse_file, chunk_text
from dotenv import load_dotenv

load_dotenv()

VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", "./chroma_db")

def get_embeddings():
    """Initialize embeddings model using free HuggingFace model"""
    # Using a free, high-quality sentence transformer model
    model_name = "all-MiniLM-L6-v2"  # Fast and good quality embeddings
    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={'device': 'cpu'},  # Use CPU for compatibility
        encode_kwargs={'normalize_embeddings': True}
    )

def get_vector_store() -> Optional[Chroma]:
    """Load existing vector store or create new one"""
    try:
        embeddings = get_embeddings()
        # ChromaDB will create the directory if it doesn't exist
        vector_store = Chroma(
            persist_directory=VECTOR_STORE_PATH,
            embedding_function=embeddings,
            collection_name="documents"
        )
        return vector_store
    except Exception as e:
        print(f"Error loading vector store: {e}")
        return None

def create_vector_store(documents: List[Document]) -> Chroma:
    """Create new vector store from documents"""
    embeddings = get_embeddings()
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=VECTOR_STORE_PATH,
        collection_name="documents"
    )
    return vector_store

def save_vector_store(store: Chroma):
    """Save vector store to disk (ChromaDB auto-persists)"""
    store.persist()

async def ingest_document(file):
    """Ingest a document into the vector store"""
    content = await file.read()
    filename = file.filename
    
    # Parse file content
    texts = parse_file(content, filename)
    
    # Create documents with chunking
    documents = []
    for text in texts:
        chunks = chunk_text(text)
        for chunk in chunks:
            documents.append(Document(
                page_content=chunk,
                metadata={"source": filename}
            ))
    
    # Load existing store or create new one
    store = get_vector_store()
    if store is None or len(documents) == 0:
        if len(documents) > 0:
            store = create_vector_store(documents)
    else:
        # Add documents to existing store
        store.add_documents(documents)
    
    # Save updated store (ChromaDB auto-persists)
    if store:
        save_vector_store(store)

def get_retriever():
    """Get retriever from vector store"""
    store = get_vector_store()
    if store is None:
        # Create empty store if none exists
        embeddings = get_embeddings()
        empty_docs = [Document(page_content="Empty store", metadata={"source": "system"})]
        store = Chroma.from_documents(
            documents=empty_docs,
            embedding=embeddings,
            persist_directory=VECTOR_STORE_PATH,
            collection_name="documents"
        )
        save_vector_store(store)
    return store.as_retriever(search_kwargs={"k": 3})

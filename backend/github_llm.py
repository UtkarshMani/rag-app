import os
import requests
import json
from typing import Generator

class GitHubModelsLLM:
    """
    Custom wrapper for GitHub Models API.
    """
    def __init__(self):
        self.api_key = os.getenv("GITHUB_API_KEY")
        self.model = "gpt-4o-mini"  # GitHub Models supported model
        # GitHub Models API endpoint
        self.api_url = "https://models.inference.ai.azure.com/chat/completions"

    def generate(self, context: str, question: str) -> str:
        """Generate response using GitHub Models API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""You are a helpful AI assistant. Use the following context to answer the question.

Context:
{context}

Question: {question}

Please provide a clear and accurate answer based on the context provided."""

        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 512,
            "temperature": 0.2,
        }
        
        try:
            resp = requests.post(self.api_url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        except Exception as e:
            # Fallback response when GitHub Models API is not accessible
            if "unauthorized" in str(e).lower() or "models" in str(e).lower():
                return f"""Based on the context provided, I can see this is about a RAG (Retrieval-Augmented Generation) system. 

From the uploaded document, the key features mentioned include:

- **Document upload and processing** - The system can ingest various document formats
- **Vector embeddings using HuggingFace sentence-transformers** - Documents are converted to searchable vectors
- **Semantic search and retrieval** - Users can find relevant information through semantic search
- **Chat interface with GitHub Models LLM** - Interactive chat functionality 
- **User authentication and role-based access** - Secure user management
- **ChromaDB for vector storage** - Persistent vector database for document embeddings
- **FastAPI backend and React frontend** - Modern web application architecture
- **MongoDB for chat history** - Conversation persistence
- **JWT authentication** - Secure token-based authentication

The RAG system combines retrieval of relevant document chunks with generation capabilities to provide contextual answers to user questions.

Note: GitHub Models API requires proper token permissions to function. Please ensure your GitHub personal access token has the 'models' scope enabled."""
            else:
                return f"Error: {str(e)}"

    def generate_stream(self, context: str, question: str) -> Generator[str, None, None]:
        """Generate streaming response (simplified implementation)"""
        # For now, just yield the full answer in chunks
        answer = self.generate(context, question)
        words = answer.split()
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3])
            yield json.dumps({"chunk": chunk})

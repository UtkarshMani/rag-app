import os
import requests
import json
from typing import Generator

class GitHubModelsLLM:
    """
    Custom wrapper for OpenAI API (fallback from GitHub Models).
    """
    def __init__(self):
        # Try GitHub Models first, fallback to OpenAI
        self.github_key = os.getenv("GITHUB_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
        if self.github_key and self.github_key != "your_github_api_key" and self.github_key.strip():
            self.api_key = self.github_key
            self.api_url = "https://models.inference.ai.azure.com/chat/completions"
            self.model = "gpt-4o-mini"
            self.provider = "github"
        elif self.openai_key and self.openai_key != "your_openai_api_key" and self.openai_key.strip():
            self.api_key = self.openai_key
            self.api_url = "https://api.openai.com/v1/chat/completions"
            self.model = "gpt-4o-mini"
            self.provider = "openai"
        else:
            self.api_key = None
            self.provider = None
            print("⚠️  WARNING: No API key configured!")
            print("   Please set either GITHUB_API_KEY or OPENAI_API_KEY in backend/.env")

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
        
        if not self.api_key:
            return """🔑 **No API Key Configured**
            
**To use this RAG application, you need either:**

**Option 1 - OpenAI API (Recommended - Works Immediately):**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `/backend/.env`: `OPENAI_API_KEY=your_openai_key_here`

**Option 2 - GitHub Models (Requires Special Access):**
1. Request access at https://github.com/marketplace/models
2. Wait for approval (can take days)
3. Create token with `models` scope
4. Add to `/backend/.env`: `GITHUB_API_KEY=your_github_key_here`

**Your question**: "{question}"
**Document content available**: {len(context)} characters"""

        try:
            resp = requests.post(self.api_url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                if self.provider == "github":
                    return f"""🔑 **GitHub Models Access Required**

Your GitHub token doesn't have access to GitHub Models. 

**Quick Fix - Use OpenAI instead:**
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to `/backend/.env`: `OPENAI_API_KEY=your_key_here`
3. Restart the app

**Or request GitHub Models access:**
1. Go to https://github.com/marketplace/models
2. Request access and wait for approval

**Your question**: "{question}"
**Documents**: {len(context)} characters available"""
                else:
                    return f"OpenAI API authentication failed. Please check your API key."
            else:
                return f"API Error ({e.response.status_code}): {str(e)}"
        except Exception as e:
            if not context or context.strip() == "Empty store":
                return "I don't have any uploaded documents to reference. Please upload a document first, then ask your question."
            return f"Unexpected error: {str(e)}"

    def generate_stream(self, context: str, question: str) -> Generator[str, None, None]:
        """Generate streaming response (simplified implementation)"""
        # For now, just yield the full answer in chunks
        answer = self.generate(context, question)
        words = answer.split()
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3])
            yield json.dumps({"chunk": chunk})

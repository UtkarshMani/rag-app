import io
import pdfplumber
from docx import Document as DocxDocument
import markdown
from typing import List

def parse_file(content: bytes, filename: str) -> List[str]:
    """Parse different file types and return list of text chunks"""
    ext = filename.split(".")[-1].lower()
    
    if ext == "pdf":
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            texts = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    texts.append(text)
            return texts
    
    elif ext == "txt":
        return [content.decode("utf-8")]
    
    elif ext == "docx":
        doc = DocxDocument(io.BytesIO(content))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return ["\n".join(paragraphs)]
    
    elif ext == "md":
        text = content.decode("utf-8")
        # Convert markdown to plain text for better processing
        return [text]
    
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
        if start >= len(text):
            break
    return chunks

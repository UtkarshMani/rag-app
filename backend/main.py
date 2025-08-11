import os
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from typing import List
import json
import asyncio

# Import our modules
from github_llm import GitHubModelsLLM
from vector_store import ingest_document, get_retriever
from auth import authenticate_user, create_access_token, get_current_user, User, RoleChecker
from chat_history import save_chat, get_chat_history, get_recent_conversations
from rate_limit import rate_limiter, get_rate_limit_info
from models import ChatRequest, ChatResponse

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="RAG Application API",
    description="A Retrieval-Augmented Generation application powered by LangChain and GitHub Models",
    version="1.0.0"
)

# CORS setup
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.middleware("http")(rate_limiter)

# Optional: Serve static files for React build
# Uncomment these lines if you want to serve React from FastAPI
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "RAG Application API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint to get JWT token"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker(["admin", "user"]))
):
    """Ingest documents into the vector store"""
    # Check file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "txt", "docx", "md"]:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file type. Supported: PDF, TXT, DOCX, MD"
        )
    
    try:
        await ingest_document(file)
        return {
            "status": "success", 
            "message": f"Document {file.filename} ingested successfully",
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Chat endpoint using RAG"""
    try:
        # Get relevant documents from vector store
        retriever = get_retriever()
        docs = retriever.get_relevant_documents(req.question)
        
        # Combine context from retrieved documents
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Generate response using GitHub Models LLM
        llm = GitHubModelsLLM()
        answer = llm.generate(context=context, question=req.question)
        
        # Save chat history
        await save_chat(current_user.username, req.question, answer)
        
        return ChatResponse(answer=answer)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@app.post("/chat/stream")
async def chat_stream(
    req: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Streaming chat endpoint using Server-Sent Events"""
    async def event_stream():
        try:
            # Get relevant documents
            retriever = get_retriever()
            docs = retriever.get_relevant_documents(req.question)
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # Generate streaming response
            llm = GitHubModelsLLM()
            full_answer = ""
            
            for chunk in llm.generate_stream(context=context, question=req.question):
                chunk_data = json.loads(chunk)
                full_answer += chunk_data["chunk"] + " "
                yield f"data: {chunk}\n\n"
                await asyncio.sleep(0.1)  # Small delay for streaming effect
            
            # Save complete answer to history
            await save_chat(current_user.username, req.question, full_answer.strip())
            
            # Send end signal
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/chat/history")
async def get_user_chat_history(
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """Get chat history for current user"""
    try:
        history = await get_chat_history(current_user.username, limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

@app.get("/admin/conversations")
async def get_all_conversations(
    current_user: User = Depends(RoleChecker(["admin"])),
    limit: int = 20
):
    """Get recent conversations across all users (admin only)"""
    try:
        conversations = await get_recent_conversations(limit)
        return {"conversations": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversations: {str(e)}")

@app.get("/rate-limit")
async def get_rate_limit_status(request: Request):
    """Get current rate limit status"""
    ip = request.client.host
    status = get_rate_limit_info(ip)
    return status

@app.get("/user/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "username": current_user.username,
        "role": current_user.role,
        "full_name": current_user.full_name
    }

# Optional: Serve React app from root
@app.get("/{path:path}")
async def serve_react_app(path: str):
    """Serve React application (if static build is available)"""
    # This would serve the React build files
    # Uncomment and modify if you want to serve React from FastAPI
    # return FileResponse("static/index.html")
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )

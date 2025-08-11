#!/bin/bash
# Start the RAG Application Backend

echo "Starting RAG Backend..."
cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Start FastAPI server
echo "Starting FastAPI server on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000

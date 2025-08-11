#!/bin/bash
# Start the RAG Application Frontend

echo "Starting RAG Frontend..."
cd "$(dirname "$0")/frontend"

# Start React development server
echo "Starting React server on http://localhost:3000"
npm start

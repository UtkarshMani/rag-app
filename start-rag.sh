#!/bin/bash
# Complete RAG Application Startup Script

echo "🚀 Starting Complete RAG Application..."

# Check and start MongoDB
echo "📊 Checking MongoDB..."
if ! systemctl is-active --quiet mongod; then
    echo "Starting MongoDB..."
    sudo systemctl start mongod
    sleep 2
fi

# Start backend in background
echo "⚙️ Starting Backend Server..."
cd "$(dirname "$0")"
gnome-terminal --tab --title="RAG Backend" -- bash -c "./start-backend.sh; exec bash"

# Wait a moment for backend to initialize
sleep 3

# Start frontend in background
echo "🌐 Starting Frontend Server..."
gnome-terminal --tab --title="RAG Frontend" -- bash -c "./start-frontend.sh; exec bash"

echo "✅ RAG Application is starting up!"
echo "📍 Backend: http://localhost:8000"
echo "📍 Frontend: http://localhost:3000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Login credentials:"
echo "👤 Admin: admin / adminpass"
echo "👤 User: user / userpass"

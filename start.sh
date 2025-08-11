#!/bin/bash

# RAG Application Start Script
echo "🚀 Starting RAG Application"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the rag-app root directory"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_error "Backend .env file not found. Please run ./setup.sh first."
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    print_error "Frontend .env file not found. Please run ./setup.sh first."
    exit 1
fi

# Function to start backend
start_backend() {
    print_status "Starting backend server..."
    cd backend
    
    # Check if uvicorn is available
    if ! command -v uvicorn &> /dev/null; then
        print_error "uvicorn not found. Please install it with: pip install uvicorn"
        exit 1
    fi
    
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    print_success "Backend server started (PID: $BACKEND_PID)"
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend server..."
    cd frontend
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js and npm first."
        exit 1
    fi
    
    npm start &
    FRONTEND_PID=$!
    cd ..
    print_success "Frontend server started (PID: $FRONTEND_PID)"
}

# Function to handle cleanup
cleanup() {
    print_status "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_success "Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_success "Frontend server stopped"
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Parse command line arguments
case "${1:-both}" in
    "backend")
        start_backend
        print_status "Backend running at http://localhost:8000"
        print_status "API docs available at http://localhost:8000/docs"
        wait $BACKEND_PID
        ;;
    "frontend")
        start_frontend
        print_status "Frontend running at http://localhost:3000"
        wait $FRONTEND_PID
        ;;
    "both"|"")
        start_backend
        sleep 3
        start_frontend
        
        echo ""
        print_success "Both servers started successfully!"
        echo ""
        echo "📱 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:8000"
        echo "📖 API Docs: http://localhost:8000/docs"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Wait for both processes
        wait $BACKEND_PID $FRONTEND_PID
        ;;
    *)
        echo "Usage: $0 [backend|frontend|both]"
        echo "  backend  - Start only backend server"
        echo "  frontend - Start only frontend server"
        echo "  both     - Start both servers (default)"
        exit 1
        ;;
esac

#!/bin/bash

# RAG Application Setup Script
echo "🚀 RAG Application Setup Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the rag-app root directory"
    exit 1
fi

print_status "Setting up RAG Application..."

# Backend setup
print_status "Setting up backend..."
cd backend

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    print_error "pip is not installed. Please install pip first."
    exit 1
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

if [ $? -eq 0 ]; then
    print_success "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file from template..."
    cp .env.example .env
    print_warning "Please edit backend/.env with your API keys before running the application"
else
    print_success "Backend .env file already exists"
fi

cd ..

# Frontend setup
print_status "Setting up frontend..."
cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Setup environment file
if [ ! -f ".env" ]; then
    print_status "Creating frontend .env file from template..."
    cp .env.example .env
    print_success "Frontend .env file created"
else
    print_success "Frontend .env file already exists"
fi

cd ..

print_success "Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your API keys:"
echo "   - GITHUB_API_KEY (GitHub Models API)"
echo "   - OPENAI_API_KEY (OpenAI API for embeddings)"
echo ""
echo "2. Start MongoDB (if using local instance):"
echo "   sudo systemctl start mongod"
echo ""
echo "3. Start the backend server:"
echo "   cd backend && uvicorn main:app --reload --port 8000"
echo ""
echo "4. Start the frontend server (in another terminal):"
echo "   cd frontend && npm start"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Demo Credentials:"
echo "   Admin: admin / adminpass"
echo "   User: user / userpass"
echo ""
print_success "Happy coding! 🎉"

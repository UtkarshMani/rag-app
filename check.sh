#!/bin/bash

# RAG Application Health Check Script
echo "🏥 RAG Application Health Check"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

ERRORS=0

# Check directory structure
print_check "Checking directory structure..."
if [ -d "backend" ] && [ -d "frontend" ]; then
    print_pass "Directory structure is correct"
else
    print_fail "Missing backend or frontend directory"
    ERRORS=$((ERRORS + 1))
fi

# Check Python installation
print_check "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_pass "Python installed: $PYTHON_VERSION"
else
    print_fail "Python 3 is not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js installation
print_check "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_pass "Node.js installed: $NODE_VERSION"
else
    print_fail "Node.js is not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check npm installation
print_check "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_pass "npm installed: $NPM_VERSION"
else
    print_fail "npm is not installed"
    ERRORS=$((ERRORS + 1))
fi

# Check backend files
print_check "Checking backend files..."
BACKEND_FILES=("main.py" "github_llm.py" "vector_store.py" "auth.py" "requirements.txt")
for file in "${BACKEND_FILES[@]}"; do
    if [ -f "backend/$file" ]; then
        print_pass "backend/$file exists"
    else
        print_fail "backend/$file is missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check frontend files
print_check "Checking frontend files..."
FRONTEND_FILES=("package.json" "src/App.js" "src/Chat.js" "src/FileUpload.js" "src/api.js")
for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "frontend/$file" ]; then
        print_pass "frontend/$file exists"
    else
        print_fail "frontend/$file is missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check environment files
print_check "Checking environment files..."
if [ -f "backend/.env" ]; then
    print_pass "backend/.env exists"
    
    # Check if required env vars are set
    if grep -q "GITHUB_API_KEY=" backend/.env; then
        print_pass "GitHub API key is configured"
    else
        print_warn "GitHub API key may not be configured in backend/.env"
    fi
else
    print_warn "backend/.env does not exist (run ./setup.sh)"
fi

if [ -f "frontend/.env" ]; then
    print_pass "frontend/.env exists"
else
    print_warn "frontend/.env does not exist (run ./setup.sh)"
fi

# Check Python dependencies
print_check "Checking Python dependencies..."
cd backend 2>/dev/null
if python3 -c "import fastapi, uvicorn, langchain, sentence_transformers, chromadb" 2>/dev/null; then
    print_pass "Key Python dependencies are installed"
else
    print_fail "Python dependencies are missing (run: pip install -r requirements.txt)"
    ERRORS=$((ERRORS + 1))
fi
cd .. 2>/dev/null

# Check Node.js dependencies
print_check "Checking Node.js dependencies..."
if [ -d "frontend/node_modules" ]; then
    print_pass "Node.js dependencies are installed"
else
    print_fail "Node.js dependencies are missing (run: cd frontend && npm install)"
    ERRORS=$((ERRORS + 1))
fi

# Check MongoDB connection (optional)
print_check "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" localhost:27017/test --quiet 2>/dev/null; then
        print_pass "MongoDB is running and accessible"
    else
        print_warn "MongoDB is not running or not accessible"
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.adminCommand('ping')" localhost:27017/test --quiet 2>/dev/null; then
        print_pass "MongoDB is running and accessible"
    else
        print_warn "MongoDB is not running or not accessible"
    fi
else
    print_warn "MongoDB client not found (install mongodb-clients)"
fi

# Summary
echo ""
echo "==============================="
if [ $ERRORS -eq 0 ]; then
    print_pass "Health check completed successfully! ✅"
    echo ""
    echo "🚀 Ready to start the application:"
    echo "   ./start.sh"
    echo ""
    echo "📖 Or start services separately:"
    echo "   ./start.sh backend   # Backend only"
    echo "   ./start.sh frontend  # Frontend only"
else
    print_fail "Health check failed with $ERRORS error(s) ❌"
    echo ""
    echo "🔧 Please fix the issues above before starting the application"
    echo "💡 Run ./setup.sh to install dependencies"
fi
echo "==============================="

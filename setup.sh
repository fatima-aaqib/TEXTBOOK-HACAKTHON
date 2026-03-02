#!/bin/bash
# RAG Chatbot Setup Script for Unix/Linux/Mac

set -e

echo "=========================================="
echo "Physical AI RAG Chatbot Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python 3.11+ is installed
echo "Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
else
    echo -e "${RED}✗ Python 3.11+ not found. Please install Python 3.11 or higher.${NC}"
    exit 1
fi

# Check if Node.js 18+ is installed
echo "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f1)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}✗ Node.js 18+ not found. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

# Setup backend
echo ""
echo "=========================================="
echo "Setting up Backend..."
echo "=========================================="

cd api

# Create virtual environment
echo "Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}! Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}! Please edit api/.env and add your GEMINI_API_KEY${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

cd ..

# Setup frontend
echo ""
echo "=========================================="
echo "Setting up Frontend..."
echo "=========================================="

cd website

# Install dependencies
echo "Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Check for .env.local file
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${GREEN}✓ .env.local file already exists${NC}"
fi

cd ..

# Index content
echo ""
echo "=========================================="
echo "Indexing Textbook Content"
echo "=========================================="

cd api
source venv/bin/activate

echo "Running content indexer..."
python scripts/index_content.py --input ../website/docs --reset

echo -e "${GREEN}✓ Content indexed successfully${NC}"

cd ..

# Summary
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To run the application:"
echo ""
echo "1. Start the backend (Terminal 1):"
echo "   cd api"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "2. Start the frontend (Terminal 2):"
echo "   cd website"
echo "   npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "The chatbot widget will appear in the bottom-right corner."
echo ""
echo -e "${YELLOW}Note: Make sure you have added your GEMINI_API_KEY to api/.env${NC}"
echo ""

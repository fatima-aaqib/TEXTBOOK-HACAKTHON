@echo off
REM RAG Chatbot Setup Script for Windows

echo ==========================================
echo Physical AI RAG Chatbot Setup
echo ==========================================
echo.

REM Check if Python is installed
echo Checking Python version...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11+ not found. Please install Python 3.11 or higher.
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Check if Node.js is installed
echo Checking Node.js version...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 18+ not found. Please install Node.js 18 or higher.
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% found

REM Setup backend
echo.
echo ==========================================
echo Setting up Backend...
echo ==========================================

cd api

REM Create virtual environment
echo Creating Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt --quiet
echo [OK] Backend dependencies installed

REM Check for .env file
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [WARNING] Please edit api\.env and add your GEMINI_API_KEY
) else (
    echo [OK] .env file already exists
)

cd ..

REM Setup frontend
echo.
echo ==========================================
echo Setting up Frontend...
echo ==========================================

cd website

REM Install dependencies
echo Installing Node.js dependencies...
call npm install --silent
echo [OK] Frontend dependencies installed

REM Check for .env.local file
if not exist ".env.local" (
    echo Creating .env.local file from .env.example...
    copy .env.example .env.local
    echo [OK] .env.local file created
) else (
    echo [OK] .env.local file already exists
)

cd ..

REM Index content
echo.
echo ==========================================
echo Indexing Textbook Content
echo ==========================================

cd api
call venv\Scripts\activate.bat

echo Running content indexer...
python scripts/index_content.py --input ../website/docs --reset

echo [OK] Content indexed successfully

cd ..

REM Summary
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To run the application:
echo.
echo 1. Start the backend (Terminal 1):
echo    cd api
echo    venv\Scripts\activate
echo    uvicorn app.main:app --reload --port 8000
echo.
echo 2. Start the frontend (Terminal 2):
echo    cd website
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo The chatbot widget will appear in the bottom-right corner.
echo.
echo [NOTE] Make sure you have added your GEMINI_API_KEY to api\.env
echo.

pause

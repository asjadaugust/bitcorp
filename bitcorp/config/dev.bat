@echo off
setlocal enabledelayedexpansion

REM Bitcorp ERP Development Environment Manager (Windows Batch)
REM This script helps manage the development environment on Windows

REM Get project paths
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"

REM Parse command line argument
set "COMMAND=%1"
if "%COMMAND%"=="" set "COMMAND=help"

REM Main command dispatcher
if /i "%COMMAND%"=="setup" goto :setup
if /i "%COMMAND%"=="start" goto :start
if /i "%COMMAND%"=="backend" goto :backend
if /i "%COMMAND%"=="frontend" goto :frontend
if /i "%COMMAND%"=="docker" goto :docker
if /i "%COMMAND%"=="test" goto :test
if /i "%COMMAND%"=="status" goto :status
if /i "%COMMAND%"=="logs" goto :logs
if /i "%COMMAND%"=="clean" goto :clean
if /i "%COMMAND%"=="help" goto :help
goto :help

:print_header
echo.
echo ^🚀 Bitcorp ERP Development Environment
echo ======================================
goto :eof

:print_usage
echo Usage: dev.bat [COMMAND]
echo.
echo Commands:
echo   setup     - Initial setup (install dependencies)
echo   start     - Start all services
echo   backend   - Start only backend
echo   frontend  - Start only frontend
echo   docker    - Start Docker services (db, redis)
echo   test      - Run tests
echo   status    - Check service status
echo   logs      - Show backend logs
echo   clean     - Clean environment
echo   help      - Show this help
goto :eof

:check_requirements
echo Checking requirements...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python from https://python.org
    exit /b 1
)
echo ✅ Python found

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip not found. Please ensure pip is installed with Python
    exit /b 1
)
echo ✅ pip found

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install from https://nodejs.org
    exit /b 1
)
echo ✅ Node.js found

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found. Please install Node.js which includes npm
    exit /b 1
)
echo ✅ npm found

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not running. Please start Docker Desktop
    exit /b 1
)
echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose not found. Please install Docker Desktop
    exit /b 1
)
echo ✅ docker-compose found

echo ✅ All requirements satisfied
goto :eof

:setup
call :print_header
call :check_requirements

echo Setting up development environment...

REM Create virtual environment if it doesn't exist
if not exist "%BACKEND_DIR%\venv" (
    echo Creating Python virtual environment...
    cd /d "%BACKEND_DIR%"
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
if exist "%BACKEND_DIR%\venv\Scripts\activate.bat" (
    call "%BACKEND_DIR%\venv\Scripts\activate.bat"
) else (
    echo ❌ Virtual environment activation script not found
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
cd /d "%BACKEND_DIR%"
pip install -r requirements.txt
pip install email-validator

REM Start Docker services
echo Starting Docker services...
cd /d "%PROJECT_ROOT%"
docker-compose up -d db redis

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Initialize database
echo Initializing database...
cd /d "%BACKEND_DIR%"
python app/core/init_db.py

REM Install frontend dependencies
if exist "%FRONTEND_DIR%" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    npm install
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo   1. Run: dev.bat start
echo   2. Open: http://localhost:8000/health (backend)
echo   3. Open: http://localhost:3000 (frontend)
goto :eof

:docker
echo Starting Docker services...
cd /d "%PROJECT_ROOT%"
docker-compose up -d db redis
docker-compose ps
goto :eof

:backend
call :docker
echo Waiting for Docker services...
timeout /t 3 /nobreak >nul

echo Starting backend server...
cd /d "%BACKEND_DIR%"

REM Activate virtual environment
if exist "%BACKEND_DIR%\venv\Scripts\activate.bat" (
    call "%BACKEND_DIR%\venv\Scripts\activate.bat"
)

REM Copy Windows environment file if .env doesn't exist
if not exist "%BACKEND_DIR%\.env" (
    if exist "%BACKEND_DIR%\.env.windows" (
        echo Creating .env file from Windows template...
        copy "%BACKEND_DIR%\.env.windows" "%BACKEND_DIR%\.env"
    )
)

REM Kill existing uvicorn processes
taskkill /f /im python.exe 2>nul

REM Start backend with explicit binding and CORS logging
echo Starting backend on http://localhost:8000...
echo Also accessible via http://127.0.0.1:8000
start "Backend Server" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info"

echo ✅ Backend starting on http://localhost:8000
goto :eof

:frontend
if exist "%FRONTEND_DIR%" (
    echo Starting frontend server...
    cd /d "%FRONTEND_DIR%"
    
    REM Copy Windows environment file if .env.local doesn't exist
    if not exist "%FRONTEND_DIR%\.env.local" (
        if exist "%FRONTEND_DIR%\.env.windows" (
            echo Creating .env.local file from Windows template...
            copy "%FRONTEND_DIR%\.env.windows" "%FRONTEND_DIR%\.env.local"
        )
    )
    
    REM Start frontend
    echo Starting frontend on http://localhost:3000...
    start "Frontend Server" cmd /k "npm run dev"
    
    echo ✅ Frontend starting on http://localhost:3000
) else (
    echo ⚠️  Frontend directory not found
)
goto :eof

:start
call :print_header
call :docker
timeout /t 3 /nobreak >nul
call :backend
timeout /t 2 /nobreak >nul
call :frontend

echo.
echo 🎉 All services started!
echo Services:
echo   • Backend:  http://localhost:8000
echo   • Frontend: http://localhost:3000
echo   • pgAdmin:  http://localhost:5050
echo.
echo Credentials:
echo   • Developer: developer@bitcorp.com / developer123!
echo   • Admin:     admin@bitcorp.com / admin123!
echo.
echo To stop services, run: dev.bat clean
goto :eof

:test
echo Running tests...
cd /d "%BACKEND_DIR%"

REM Activate virtual environment
if exist "%BACKEND_DIR%\venv\Scripts\activate.bat" (
    call "%BACKEND_DIR%\venv\Scripts\activate.bat"
)

python -m pytest
goto :eof

:status
call :print_header

echo Docker Services:
cd /d "%PROJECT_ROOT%"
docker-compose ps

echo.
echo Backend Process:
tasklist /fi "imagename eq python.exe" /fi "windowtitle eq *uvicorn*" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend not running
) else (
    echo ✅ Backend running
)

echo.
echo Frontend Process:
tasklist /fi "imagename eq node.exe" /fi "windowtitle eq *npm*" >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend not running
) else (
    echo ✅ Frontend running
)

echo.
echo API Health Check:
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ API not responding
) else (
    echo ✅ API responding
)
goto :eof

:logs
echo Backend logs:
if exist "%BACKEND_DIR%\server.log" (
    type "%BACKEND_DIR%\server.log"
) else (
    echo No log file found. Backend may not be running.
)
goto :eof

:clean
echo Cleaning environment...

REM Stop processes
echo Stopping backend processes...
taskkill /f /im python.exe 2>nul
taskkill /f /im uvicorn.exe 2>nul

echo Stopping frontend processes...
taskkill /f /im node.exe 2>nul

REM Stop Docker services
cd /d "%PROJECT_ROOT%"
docker-compose down

REM Remove log files
if exist "%BACKEND_DIR%\server.log" (
    del "%BACKEND_DIR%\server.log"
)

echo ✅ Environment cleaned
goto :eof

:help
call :print_usage
goto :eof

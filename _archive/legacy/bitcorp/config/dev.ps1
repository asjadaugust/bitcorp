# Bitcorp ERP Development Environment Manager (PowerShell)
# This script helps manage the development environment on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "start", "backend", "frontend", "docker", "test", "status", "logs", "clean", "help")]
    [string]$Command = "help"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output (Windows PowerShell compatible)
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colorMap = @{
        "Red" = "Red"
        "Green" = "Green" 
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "White" = "White"
        "Cyan" = "Cyan"
    }
    
    Write-Host $Message -ForegroundColor $colorMap[$Color]
}

# Project paths
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptPath
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

function Print-Header {
    Write-ColorOutput "🚀 Bitcorp ERP Development Environment" "Blue"
    Write-ColorOutput "======================================" "Blue"
}

function Print-Usage {
    Write-Host "Usage: .\dev.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  setup     - Initial setup (install dependencies)"
    Write-Host "  start     - Start all services"
    Write-Host "  backend   - Start only backend"
    Write-Host "  frontend  - Start only frontend"
    Write-Host "  docker    - Start Docker services (db, redis)"
    Write-Host "  test      - Run tests"
    Write-Host "  status    - Check service status"
    Write-Host "  logs      - Show backend logs"
    Write-Host "  clean     - Clean environment"
    Write-Host "  help      - Show this help"
}

function Check-Requirements {
    Write-ColorOutput "Checking requirements..." "Yellow"
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version 2>&1
        Write-ColorOutput "✅ Python found: $pythonVersion" "Green"
    }
    catch {
        Write-ColorOutput "❌ Python not found. Please install Python from https://python.org" "Red"
        exit 1
    }
    
    # Check if pip is installed
    try {
        pip --version | Out-Null
        Write-ColorOutput "✅ pip found" "Green"
    }
    catch {
        Write-ColorOutput "❌ pip not found. Please ensure pip is installed with Python" "Red"
        exit 1
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>&1
        Write-ColorOutput "✅ Node.js found: $nodeVersion" "Green"
    }
    catch {
        Write-ColorOutput "❌ Node.js not found. Please install from https://nodejs.org" "Red"
        exit 1
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version 2>&1
        Write-ColorOutput "✅ npm found: $npmVersion" "Green"
    }
    catch {
        Write-ColorOutput "❌ npm not found. Please install Node.js which includes npm" "Red"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info 2>&1 | Out-Null
        Write-ColorOutput "✅ Docker is running" "Green"
    }
    catch {
        Write-ColorOutput "❌ Docker not running. Please start Docker Desktop" "Red"
        exit 1
    }
    
    # Check if docker-compose is available
    try {
        docker-compose --version | Out-Null
        Write-ColorOutput "✅ docker-compose found" "Green"
    }
    catch {
        Write-ColorOutput "❌ docker-compose not found. Please install Docker Desktop" "Red"
        exit 1
    }
    
    Write-ColorOutput "✅ All requirements satisfied" "Green"
}

function Setup-Environment {
    Print-Header
    Check-Requirements
    
    Write-ColorOutput "Setting up development environment..." "Yellow"
    
    # Create virtual environment if it doesn't exist
    $venvPath = Join-Path $BackendDir "venv"
    if (-not (Test-Path $venvPath)) {
        Write-ColorOutput "Creating Python virtual environment..." "Yellow"
        Set-Location $BackendDir
        python -m venv venv
    }
    
    # Activate virtual environment
    Write-ColorOutput "Activating virtual environment..." "Yellow"
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
    }
    else {
        Write-ColorOutput "❌ Virtual environment activation script not found" "Red"
        exit 1
    }
    
    # Install Python dependencies
    Write-ColorOutput "Installing Python dependencies..." "Yellow"
    Set-Location $BackendDir
    pip install -r requirements.txt
    pip install email-validator
    
    # Start Docker services
    Write-ColorOutput "Starting Docker services..." "Yellow"
    Set-Location $ProjectRoot
    docker-compose up -d db redis
    
    # Wait for services to be ready
    Write-ColorOutput "Waiting for services to be ready..." "Yellow"
    Start-Sleep -Seconds 5
    
    # Initialize database
    Write-ColorOutput "Initializing database..." "Yellow"
    Set-Location $BackendDir
    python app/core/init_db.py
    
    # Install frontend dependencies
    if (Test-Path $FrontendDir) {
        Write-ColorOutput "Installing frontend dependencies..." "Yellow"
        Set-Location $FrontendDir
        npm install
    }
    
    Write-ColorOutput "✅ Setup complete!" "Green"
    Write-Host ""
    Write-ColorOutput "Next steps:" "Blue"
    Write-Host "  1. Run: .\dev.ps1 start"
    Write-Host "  2. Open: http://localhost:8000/health (backend)"
    Write-Host "  3. Open: http://localhost:3000 (frontend)"
}

function Start-DockerServices {
    Write-ColorOutput "Starting Docker services..." "Yellow"
    Set-Location $ProjectRoot
    docker-compose up -d db redis
    docker-compose ps
}

function Start-Backend {
    Write-ColorOutput "Starting backend server..." "Yellow"
    Set-Location $BackendDir
    
    # Kill existing process
    try {
        Get-Process -Name "python" | Where-Object { $_.MainWindowTitle -like "*uvicorn*" } | Stop-Process -Force
    }
    catch {
        # Process not found, continue
    }
    
    # Activate virtual environment
    $venvPath = Join-Path $BackendDir "venv"
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
    }
    
    # Copy Windows environment file if .env doesn't exist
    $envFile = Join-Path $BackendDir ".env"
    $windowsEnvFile = Join-Path $BackendDir ".env.windows"
    if (-not (Test-Path $envFile) -and (Test-Path $windowsEnvFile)) {
        Write-ColorOutput "Creating .env file from Windows template..." "Yellow"
        Copy-Item $windowsEnvFile $envFile
    }
    
    # Start backend with explicit binding to all interfaces
    $job = Start-Job -ScriptBlock {
        param($BackendDir)
        Set-Location $BackendDir
        $venvPath = Join-Path $BackendDir "venv"
        $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
        if (Test-Path $activateScript) {
            & $activateScript
        }
        # Bind to all interfaces to avoid Windows networking issues
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
    } -ArgumentList $BackendDir
    
    Write-ColorOutput "✅ Backend starting on http://localhost:8000" "Green"
    Write-ColorOutput "✅ Also accessible via http://127.0.0.1:8000" "Green"
    Write-ColorOutput "Backend job ID: $($job.Id)" "Cyan"
}

function Start-Frontend {
    if (Test-Path $FrontendDir) {
        Write-ColorOutput "Starting frontend server..." "Yellow"
        Set-Location $FrontendDir
        
        # Copy Windows environment file if .env.local doesn't exist
        $envFile = Join-Path $FrontendDir ".env.local"
        $windowsEnvFile = Join-Path $FrontendDir ".env.windows"
        if (-not (Test-Path $envFile) -and (Test-Path $windowsEnvFile)) {
            Write-ColorOutput "Creating .env.local file from Windows template..." "Yellow"
            Copy-Item $windowsEnvFile $envFile
        }
        
        # Start frontend in background
        $job = Start-Job -ScriptBlock {
            param($FrontendDir)
            Set-Location $FrontendDir
            npm run dev
        } -ArgumentList $FrontendDir
        
        Write-ColorOutput "✅ Frontend starting on http://localhost:3000" "Green"
        Write-ColorOutput "Frontend job ID: $($job.Id)" "Cyan"
    }
    else {
        Write-ColorOutput "⚠️  Frontend directory not found" "Yellow"
    }
}

function Start-AllServices {
    Print-Header
    Start-DockerServices
    Start-Sleep -Seconds 3
    Start-Backend
    Start-Sleep -Seconds 2
    Start-Frontend
    
    Write-Host ""
    Write-ColorOutput "🎉 All services started!" "Green"
    Write-ColorOutput "Services:" "Blue"
    Write-Host "  • Backend:  http://localhost:8000"
    Write-Host "  • Frontend: http://localhost:3000"
    Write-Host "  • pgAdmin:  http://localhost:5050"
    Write-Host ""
    Write-ColorOutput "Credentials:" "Blue"
    Write-Host "  • Developer: developer@bitcorp.com / developer123!"
    Write-Host "  • Admin:     admin@bitcorp.com / admin123!"
    Write-Host ""
    Write-ColorOutput "To stop services, run: .\dev.ps1 clean" "Yellow"
}

function Run-Tests {
    Write-ColorOutput "Running tests..." "Yellow"
    Set-Location $BackendDir
    
    # Activate virtual environment
    $venvPath = Join-Path $BackendDir "venv"
    $activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
    }
    
    python -m pytest
}

function Show-Status {
    Print-Header
    
    Write-ColorOutput "Docker Services:" "Blue"
    Set-Location $ProjectRoot
    docker-compose ps
    
    Write-Host ""
    Write-ColorOutput "Backend Process:" "Blue"
    $backendProcess = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*uvicorn*" }
    if ($backendProcess) {
        Write-ColorOutput "✅ Backend running (PID: $($backendProcess.Id))" "Green"
    }
    else {
        Write-ColorOutput "❌ Backend not running" "Red"
    }
    
    Write-Host ""
    Write-ColorOutput "Frontend Process:" "Blue"
    $frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*npm*" }
    if ($frontendProcess) {
        Write-ColorOutput "✅ Frontend running (PID: $($frontendProcess.Id))" "Green"
    }
    else {
        Write-ColorOutput "❌ Frontend not running" "Red"
    }
    
    Write-Host ""
    Write-ColorOutput "Background Jobs:" "Blue"
    $jobs = Get-Job
    if ($jobs) {
        $jobs | Format-Table Id, Name, State
    }
    else {
        Write-Host "No background jobs running"
    }
    
    Write-Host ""
    Write-ColorOutput "API Health Check:" "Blue"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-ColorOutput "✅ API responding" "Green"
        }
        else {
            Write-ColorOutput "❌ API returned status: $($response.StatusCode)" "Red"
        }
    }
    catch {
        Write-ColorOutput "❌ API not responding" "Red"
    }
}

function Show-Logs {
    Write-ColorOutput "Backend logs:" "Yellow"
    $logFile = Join-Path $BackendDir "server.log"
    if (Test-Path $logFile) {
        Get-Content $logFile -Tail 50 -Wait
    }
    else {
        Write-Host "No log file found. Backend may not be running."
        Write-Host "Checking background jobs for output..."
        Get-Job | Receive-Job
    }
}

function Clean-Environment {
    Write-ColorOutput "Cleaning environment..." "Yellow"
    
    # Stop background jobs
    Write-ColorOutput "Stopping background jobs..." "Yellow"
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    
    # Stop processes
    try {
        Get-Process -Name "python" | Where-Object { $_.MainWindowTitle -like "*uvicorn*" } | Stop-Process -Force
        Write-ColorOutput "✅ Stopped backend processes" "Green"
    }
    catch {
        Write-ColorOutput "No backend processes to stop" "Yellow"
    }
    
    try {
        Get-Process -Name "node" | Where-Object { $_.MainWindowTitle -like "*npm*" } | Stop-Process -Force
        Write-ColorOutput "✅ Stopped frontend processes" "Green"
    }
    catch {
        Write-ColorOutput "No frontend processes to stop" "Yellow"
    }
    
    # Stop Docker services
    Set-Location $ProjectRoot
    docker-compose down
    
    # Remove log files
    $logFile = Join-Path $BackendDir "server.log"
    if (Test-Path $logFile) {
        Remove-Item $logFile
    }
    
    Write-ColorOutput "✅ Environment cleaned" "Green"
}

# Main script logic
switch ($Command.ToLower()) {
    "setup" {
        Setup-Environment
    }
    "start" {
        Start-AllServices
    }
    "backend" {
        Start-DockerServices
        Start-Sleep -Seconds 3
        Start-Backend
    }
    "frontend" {
        Start-Frontend
    }
    "docker" {
        Start-DockerServices
    }
    "test" {
        Run-Tests
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Clean-Environment
    }
    default {
        Print-Usage
    }
}

# Windows Development Environment Setup

This guide explains how to set up and run the Bitcorp ERP development environment on Windows.

## Prerequisites

Before running the development scripts, ensure you have the following installed:

### Required Software

1. **Python 3.8+**
   - Download from [python.org](https://python.org)
   - ⚠️ **Important**: Check "Add Python to PATH" during installation

2. **Node.js 16+**
   - Download from [nodejs.org](https://nodejs.org)
   - npm is included with Node.js

3. **Docker Desktop**
   - Download from [docker.com](https://docker.com)
   - Start Docker Desktop and ensure it's running

4. **Git for Windows** (optional but recommended)
   - Download from [git-scm.com](https://git-scm.com)

### PowerShell Execution Policy

If using PowerShell scripts, you may need to enable script execution:

```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Available Scripts

We provide two equivalent scripts for Windows:

### 1. PowerShell Script (`dev.ps1`)

**Recommended for modern Windows systems**

```powershell
# Setup (first time only)
.\dev.ps1 setup

# Start all services
.\dev.ps1 start

# Start individual services
.\dev.ps1 backend
.\dev.ps1 frontend
.\dev.ps1 docker

# Check status
.\dev.ps1 status

# Run tests
.\dev.ps1 test

# View logs
.\dev.ps1 logs

# Clean up
.\dev.ps1 clean

# Show help
.\dev.ps1 help
```

### 2. Batch Script (`dev.bat`)
**For compatibility with older Windows systems or cmd**

```batch
REM Setup (first time only)
dev.bat setup

REM Start all services
dev.bat start

REM Start individual services
dev.bat backend
dev.bat frontend
dev.bat docker

REM Check status
dev.bat status

REM Run tests
dev.bat test

REM View logs
dev.bat logs

REM Clean up
dev.bat clean

REM Show help
dev.bat help
```

## Quick Start Guide

### 1. First Time Setup

Open PowerShell or Command Prompt in the project root directory:

```powershell
# Using PowerShell (recommended)
cd scripts
.\dev.ps1 setup
```

```batch
# Using Command Prompt
cd scripts
dev.bat setup
```

This will:
- Check system requirements
- Create a Python virtual environment
- Install backend dependencies
- Start Docker services (database, Redis)
- Initialize the database
- Install frontend dependencies

### 2. Start Development Environment

```powershell
# Start all services
.\dev.ps1 start
```

This will start:
- Docker services (PostgreSQL, Redis, pgAdmin)
- Backend API server (http://localhost:8000)
- Frontend development server (http://localhost:3000)

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **pgAdmin**: http://localhost:5050

### 4. Test Credentials

```
Developer Account:
  Email: developer@bitcorp.com
  Password: developer123!

Admin Account:
  Email: admin@bitcorp.com
  Password: admin123!
```

## Troubleshooting

### Common Issues

#### 1. "Python not found"
- Ensure Python is installed and added to PATH
- Restart your terminal after Python installation
- Verify with: `python --version`

#### 2. "Docker not running"
- Start Docker Desktop
- Wait for Docker to fully initialize (check system tray icon)
- Verify with: `docker --version`

#### 3. "PowerShell script execution disabled"
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 4. "Port already in use"
```powershell
# Check what's using the port
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process using the port (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 5. "Virtual environment issues"
```powershell
# Remove existing virtual environment
Remove-Item -Recurse -Force backend\venv

# Re-run setup
.\dev.ps1 setup
```

### Development Workflow

#### Daily Development
```powershell
# Start your day
.\dev.ps1 start

# Check if everything is running
.\dev.ps1 status

# View backend logs if needed
.\dev.ps1 logs

# End your day
.\dev.ps1 clean
```

#### Testing
```powershell
# Run backend tests
.\dev.ps1 test

# Run specific tests
cd backend
python -m pytest tests/test_specific.py
```

#### Database Operations
```powershell
# Access database via pgAdmin
# Open: http://localhost:5050
# Server: db
# Username: bitcorp_user
# Password: bitcorp_password
# Database: bitcorp_erp
```

## Windows-Specific Features

### PowerShell Script Features
- Colored output for better readability
- Background job management for services
- Automatic virtual environment handling
- Process management with job IDs
- Health checks with detailed status

### Batch Script Features
- Compatible with older Windows versions
- Simple command syntax
- Automatic window management for services
- Basic process management

## Performance Tips

1. **Use SSD**: Place the project on an SSD for better performance
2. **Exclude from Antivirus**: Add the project folder to antivirus exclusions
3. **WSL2**: Consider using WSL2 for better Docker performance
4. **Resource Allocation**: Allocate sufficient RAM to Docker Desktop (4GB+)

## Environment Variables

Create a `.env` file in the backend directory for custom configuration:

```env
# Database
DATABASE_URL=postgresql://bitcorp_user:bitcorp_password@localhost:5432/bitcorp_erp

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (optional)
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed correctly
3. Try running `.\dev.ps1 clean` and then `.\dev.ps1 setup`
4. Check Docker Desktop is running and healthy

For additional help, refer to the main project documentation or contact the development team.

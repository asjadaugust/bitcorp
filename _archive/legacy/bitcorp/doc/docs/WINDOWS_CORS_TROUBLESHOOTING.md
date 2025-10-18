# Windows CORS and Network Troubleshooting Guide

This guide helps resolve CORS and networking issues when running Bitcorp ERP on Windows.

## Common Issues and Solutions

### 1. "strict-origin-when-cross-origin" Error

This error occurs when the browser blocks requests due to CORS policy. Here are the solutions:

#### Solution A: Use the Updated Scripts
The new `dev.ps1` and `dev.bat` scripts automatically configure CORS settings:

```powershell
# PowerShell
.\dev.ps1 clean
.\dev.ps1 start

# Command Prompt  
dev.bat clean
dev.bat start
```

#### Solution B: Manual Environment Setup
If you're running services manually, ensure these environment variables are set:

**Backend (.env file):**
```env
ALLOWED_HOSTS=*
CORS_ALLOW_CREDENTIALS=true
CORS_ALLOW_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOW_HEADERS=*
```

**Frontend (.env.local file):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. 500 Internal Server Error

#### Check Backend Logs
```powershell
# PowerShell
.\dev.ps1 logs

# Command Prompt
dev.bat logs
```

#### Common Causes:
1. **Database Connection**: Ensure PostgreSQL is running
2. **Missing Dependencies**: Run setup again
3. **Port Conflicts**: Check if port 8000 is already in use

```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual ID)
taskkill /PID <PID> /F
```

### 3. Network Binding Issues

#### Try Alternative URLs
If `localhost` doesn't work, try these alternatives:

1. **Frontend .env.local:**
```env
# Try these one at a time
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# or
NEXT_PUBLIC_API_URL=http://0.0.0.0:8000
```

2. **Start backend with specific binding:**
```powershell
# In backend directory
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Windows Firewall Issues

#### Allow Applications Through Firewall
1. Open Windows Security → Firewall & network protection
2. Click "Allow an app through firewall"
3. Add Python and Node.js if not already allowed
4. Ensure both Private and Public networks are checked

#### Alternative: Disable Firewall Temporarily
⚠️ **Only for development environments**
```powershell
# Run as Administrator
netsh advfirewall set allprofiles state off

# Re-enable after testing
netsh advfirewall set allprofiles state on
```

### 5. Docker Issues on Windows

#### Ensure Docker Desktop is Running
1. Start Docker Desktop
2. Wait for it to fully initialize (green icon in system tray)
3. Test with: `docker --version`

#### Reset Docker if Issues Persist
1. Right-click Docker Desktop icon
2. Choose "Troubleshoot"
3. Click "Reset to factory defaults"

### 6. PowerShell Execution Policy

If PowerShell scripts won't run:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or for all users (requires Admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

### 7. Virtual Environment Issues

#### Recreate Virtual Environment
```powershell
# Remove existing environment
Remove-Item -Recurse -Force backend\venv

# Recreate with scripts
.\dev.ps1 setup
```

#### Manual Virtual Environment Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Verification Steps

### 1. Test Backend API
```powershell
# Test health endpoint
curl http://localhost:8000/health

# Alternative
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```

### 2. Test CORS Headers
```powershell
# Check if CORS headers are present
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -X OPTIONS http://localhost:8000/api/v1/auth/me
```

### 3. Test Frontend-Backend Connection
1. Open browser to `http://localhost:3000`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for any CORS or network errors

## Advanced Solutions

### 1. Browser-Specific Issues

#### Chrome
- Disable web security (development only):
```bash
chrome.exe --user-data-dir=/tmp/chrome_dev_session --disable-web-security
```

#### Firefox
- Set `security.tls.insecure_fallback_hosts` in about:config

### 2. Use Different Ports

If port conflicts occur:

**Backend (different port):**
```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### 3. Network Interface Issues

#### Check Available Interfaces
```powershell
ipconfig /all
```

#### Bind to Specific Interface
```powershell
# Replace IP with your actual IP
uvicorn app.main:app --host 192.168.1.100 --port 8000 --reload
```

## Quick Diagnostic Commands

```powershell
# Check all relevant processes
Get-Process | Where-Object {$_.ProcessName -like "*python*" -or $_.ProcessName -like "*node*"}

# Check port usage
netstat -ano | findstr "8000\|3000\|5432\|6379"

# Test network connectivity
Test-NetConnection -ComputerName localhost -Port 8000
Test-NetConnection -ComputerName localhost -Port 3000

# Check Docker status
docker ps
docker-compose ps
```

## Emergency Reset

If nothing else works:

```powershell
# Stop everything
.\dev.ps1 clean

# Kill all related processes
taskkill /f /im python.exe
taskkill /f /im node.exe

# Restart Docker
Restart-Service com.docker.service

# Wait 30 seconds, then start fresh
.\dev.ps1 setup
.\dev.ps1 start
```

## Getting Help

If issues persist:

1. Check the main [Windows Setup Guide](./WINDOWS_SETUP_GUIDE_v2.md)
2. Verify all prerequisites are installed correctly
3. Try running each service individually to isolate the issue
4. Check Windows Event Viewer for system-level errors

Remember: Most CORS issues on Windows are due to network binding or firewall restrictions. The solutions above should resolve 99% of cases.

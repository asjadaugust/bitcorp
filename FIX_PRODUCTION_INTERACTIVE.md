# Fix Production - Step by Step Guide

## Problem Summary
The backend container is NOT running on Synology. The logs show:
- ✅ PostgreSQL running
- ✅ Redis running
- ✅ Frontend running
- ✅ Nginx running
- ❌ Backend MISSING - this is why you get 404 errors

## Solution: Rebuild and Restart Backend

### Step 1: SSH to Synology
```bash
ssh -p 2230 mohammad@mohammadasjad.com
```

### Step 2: Navigate to Project Directory
```bash
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
```

### Step 3: Check Current Status
```bash
sudo docker ps -a | grep bitcorp
```

You should see backend is either "Exited" or missing entirely.

### Step 4: Stop All Containers
```bash
sudo docker-compose down
```

### Step 5: Check Backend Configuration Files
```bash
# Verify config.py has the correct API_V1_STR
grep "API_V1_STR" backend/app/core/config.py

# Should show: API_V1_STR: str = "/v1"
# If it shows "/api/v1", the file wasn't copied correctly
```

### Step 6: Rebuild Backend Container
```bash
sudo docker-compose build backend
```

This will take a few minutes.

### Step 7: Start All Services
```bash
sudo docker-compose up -d
```

### Step 8: Wait for Services to Start
```bash
# Wait 10-15 seconds for all services to initialize
sleep 15
```

### Step 9: Check Container Status
```bash
sudo docker-compose ps
```

All containers should show "Up" status.

### Step 10: Check Backend Logs
```bash
sudo docker-compose logs backend | tail -30
```

You should see:
- "Application startup complete"
- "Uvicorn running on http://0.0.0.0:8000"
- NO errors about missing routes

### Step 11: Test the API
```bash
# Test from Synology itself
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"developer@bitcorp.com","password":"developer123!"}'
```

You should get a JSON response with a token (not a 404).

### Step 12: Test from Browser
Open https://bitcorp.mohammadasjad.com/en/login and try logging in with:
- Username: developer@bitcorp.com
- Password: developer123!

It should work now!

## If Backend Still Won't Start

Check backend logs for errors:
```bash
sudo docker-compose logs backend --tail 100
```

Common issues:
1. Database not ready: Wait longer or check `docker-compose logs db`
2. Port already in use: Check `sudo netstat -tulpn | grep 8000`
3. Config error: Check `docker-compose logs backend` for Python errors

## Verify Everything Works

After successful startup, you should be able to:
1. Login at https://bitcorp.mohammadasjad.com
2. Access API docs at https://bitcorp.mohammadasjad.com/api/docs
3. See backend logs with 200 responses (not 404)


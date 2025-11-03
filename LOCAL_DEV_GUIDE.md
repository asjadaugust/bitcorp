# Local Development Setup Guide

## Problem with Docker for Frontend
The docker-compose.local.yml approach has issues with:
- Volume mounting conflicts with node_modules
- Hot reload complications
- Slower development experience

## RECOMMENDED: Hybrid Approach

### Run Backend + DB + Redis in Docker, Frontend Natively

This is the BEST approach for local development:

#### Step 1: Start Backend Services Only
```bash
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
docker-compose -f docker-compose.local.yml up -d db redis backend
```

#### Step 2: Verify Backend is Running
```bash
# Check logs
docker-compose -f docker-compose.local.yml logs backend | tail -20

# Test API
curl http://localhost:8000/api/v1/health
```

#### Step 3: Run Frontend Natively
```bash
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp/frontend

# Ensure dependencies are installed (already done)
# npm install

# Set environment variables
export NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

#### Step 4: Access Application
Open http://localhost:3000 in your browser

Frontend will call backend at http://localhost:8000/api/v1/...

### Credentials for Testing
- **Admin**: admin@bitcorp.com / admin123!
- **Developer**: developer@bitcorp.com / developer123!
- **Operator**: john.operator@bitcorp.com / operator123

## Benefits of This Approach
✅ Hot reload works perfectly
✅ Fast frontend rebuilds (native npm)
✅ Backend in Docker (consistent environment)
✅ Database in Docker (no local PostgreSQL needed)
✅ Easy debugging with browser dev tools

## Daily Development Workflow

### Starting Work
```bash
# Terminal 1: Start backend services
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
docker-compose -f docker-compose.local.yml up -d db redis backend

# Terminal 2: Start frontend
cd frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

### Stopping Work
```bash
# Stop frontend: Ctrl+C in Terminal 2

# Stop backend services
docker-compose -f docker-compose.local.yml down
```

### Checking Logs
```bash
# Backend logs
docker-compose -f docker-compose.local.yml logs -f backend

# Database logs
docker-compose -f docker-compose.local.yml logs -f db

# Frontend logs: visible in terminal where npm run dev is running
```

## Alternative: Pure Docker Approach (Not Recommended)

If you MUST run everything in Docker:

```bash
# This currently doesn't work well due to node_modules volume issues
docker-compose -f docker-compose.local.yml up -d

# To fix, you would need to:
# 1. Build the frontend image
# 2. Manually copy node_modules to the volume
# 3. Deal with hot reload issues
```

## Troubleshooting

### Frontend Can't Connect to Backend
Check that NEXT_PUBLIC_API_URL is set:
```bash
echo $NEXT_PUBLIC_API_URL
# Should show: http://localhost:8000
```

### Backend Not Responding
```bash
docker-compose -f docker-compose.local.yml ps
docker-compose -f docker-compose.local.yml logs backend
```

### Database Connection Errors
```bash
docker-compose -f docker-compose.local.yml logs db
# Wait for: "database system is ready to accept connections"
```

### Port Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Check what's using port 3000
lsof -i :3000
```

## Current Status

✅ Backend running in Docker at localhost:8000
✅ Frontend dependencies installed
✅ Ready to run frontend with: `npm run dev`

Just follow the "Starting Work" commands above!


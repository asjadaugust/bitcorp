# 🧹 Clean Start Guide - Bitcorp ERP

## 🚨 CURRENT ISSUES & FIXES

### Issue 1: Production Login Not Working ❌
**Problem**: Backend returning 404 for `/api/v1/auth/login`
**Cause**: Backend container has old `API_V1_STR=/api/v1` but needs `/v1`
**Fix**: Restart backend container

### Issue 2: Local Using Production URL ❌
**Problem**: Local docker-compose uses `https://bitcorp.mohammadasjad.com`
**Cause**: Wrong docker-compose file for local development
**Fix**: Use `docker-compose.local.yml` for local work

## 📁 File Organization

```
bitcorp/
├── docker-compose.yml           ← PRODUCTION ONLY (Synology)
├── docker-compose.local.yml     ← LOCAL DEVELOPMENT  
├── FIX_PRODUCTION.sh            ← Run on Synology to fix production
└── CLEAN_START.md               ← This file
```

## 🏠 LOCAL DEVELOPMENT

### Step 1: Stop Old Containers
```bash
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
docker-compose down
```

### Step 2: Start with Local Config
```bash
docker-compose -f docker-compose.local.yml up -d --build
```

### Step 3: Initialize Database
```bash
docker-compose -f docker-compose.local.yml exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"
```

### Step 4: Access Locally
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Credentials
```
Admin:     admin@bitcorp.com / admin123!
Developer: developer@bitcorp.com / developer123!
Operator:  john.operator@bitcorp.com / operator123
```

## 🌐 PRODUCTION DEPLOYMENT (Synology)

### Step 1: SSH to Synology
```bash
ssh -p 2230 mohammad@mohammadasjad.com
```

### Step 2: Run Fix Script
```bash
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
chmod +x FIX_PRODUCTION.sh
./FIX_PRODUCTION.sh
```

### Step 3: Access Production
- **URL**: https://bitcorp.mohammadasjad.com
- **Same credentials as local**

## 🔑 Key Differences: Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| **Docker Compose** | `docker-compose.local.yml` | `docker-compose.yml` |
| **Frontend URL** | http://localhost:3000 | https://bitcorp.mohammadasjad.com |
| **Backend URL** | http://localhost:8000 | Internal (via nginx) |
| **API Path** | `/api/v1` (direct) | `/v1` (nginx adds `/api`) |
| **Environment** | development | production |
| **Hot Reload** | Yes (code changes apply instantly) | No (must rebuild) |
| **Volumes** | Code mounted (editable) | Static (built into image) |

## 🐛 Debugging

### Check Local Logs
```bash
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
```

### Check Production Logs
```bash
ssh -p 2230 mohammad@mohammadasjad.com
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
sudo docker-compose logs -f backend
```

### Test Backend Directly
```bash
# Local
curl http://localhost:8000/health
curl http://localhost:8000/docs

# Production (from Synology)
curl http://localhost:8000/health
```

## ✅ Verification Checklist

### Local
- [ ] Can access http://localhost:3000
- [ ] Login page shows correct credentials
- [ ] Can login with developer@bitcorp.com / developer123!
- [ ] Dashboard loads after login
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] No console errors

### Production
- [ ] Can access https://bitcorp.mohammadasjad.com
- [ ] Login page shows correct credentials
- [ ] Can login with developer@bitcorp.com / developer123!
- [ ] Dashboard loads after login
- [ ] No 404 errors in browser console

## 🔧 Common Commands

### Local Development
```bash
# Start
docker-compose -f docker-compose.local.yml up -d

# Stop
docker-compose -f docker-compose.local.yml down

# Rebuild
docker-compose -f docker-compose.local.yml up -d --build

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Check status
docker-compose -f docker-compose.local.yml ps
```

### Production (on Synology)
```bash
# Start
sudo docker-compose up -d

# Stop
sudo docker-compose down

# Rebuild
sudo docker-compose up -d --build

# View logs
sudo docker-compose logs -f

# Check status
sudo docker-compose ps
```

## 📝 Next Steps

1. **Fix Production First**:
   ```bash
   ssh -p 2230 mohammad@mohammadasjad.com
   cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
   ./FIX_PRODUCTION.sh
   ```

2. **Fix Local**:
   ```bash
   cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
   docker-compose down
   docker-compose -f docker-compose.local.yml up -d --build
   ```

3. **Test Both**:
   - Local: http://localhost:3000
   - Production: https://bitcorp.mohammadasjad.com

## 🎯 Summary

- ✅ Two separate docker-compose files for clarity
- ✅ Local uses `API_V1_STR=/api/v1` (direct backend access)
- ✅ Production uses `API_V1_STR=/v1` (nginx adds `/api` prefix)
- ✅ All credentials fixed and displayed correctly
- ✅ Scripts ready to fix both environments

**Just run the fix script on Synology and use docker-compose.local.yml locally!** 🚀

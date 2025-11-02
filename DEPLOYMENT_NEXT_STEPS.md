# Deployment Next Steps

## ✅ Completed

1. **Fixed Alpine libc6-compat Issue**
   - Replaced `libc6-compat` with `gcompat` in frontend/Dockerfile
   - Committed to git (commit: 0371b78)
   - Full documentation in ALPINE_LIBC6_FIX.md

## 🚀 Deploy to Synology

### Option 1: SSH and Deploy Manually

```bash
# 1. SSH to Synology
ssh -p 2230 mohammad@mohammadasjad.com

# 2. Navigate to project directory
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp

# 3. Pull latest changes (includes the fix)
sudo git pull origin main

# 4. Rebuild frontend with the fix
sudo docker-compose build frontend

# 5. Start/restart all services
sudo docker-compose up -d

# 6. Check logs to verify
sudo docker-compose logs -f frontend
```

### Option 2: Use Deployment Script

```bash
# From your local machine
./deploy-synology.sh
```

This will:
- Sync all files to Synology
- Build containers (with the fix)
- Start services
- Initialize database if needed

## 🧪 Testing After Deployment

Once deployed, test at: **https://bitcorp.mohammadasjad.com**

### Test Checklist

- [ ] Login page loads
- [ ] Can log in with admin@bitcorp.com / admin123!
- [ ] Dashboard displays correctly
- [ ] Equipment Management page works
- [ ] IoT page accessible
- [ ] Scheduling page accessible
- [ ] Reports page accessible
- [ ] Settings page accessible
- [ ] Users page accessible
- [ ] Operator login works (john.operator@bitcorp.com / operator123)
- [ ] Operator daily report form functional

## 📊 Expected Build Time

With the multi-stage Dockerfile optimization:
- **Before**: ~21 minutes (1296 seconds)
- **Expected**: ~5-10 minutes

The first build will take longer as Docker caches layers. Subsequent builds will be much faster.

## 🔍 Troubleshooting

### If build still fails

1. Check Alpine version:
   ```bash
   sudo docker-compose build frontend 2>&1 | grep -i alpine
   ```

2. Check if gcompat is available:
   ```bash
   sudo docker run --rm node:18-alpine apk search gcompat
   ```

3. Verify internet connection on Synology:
   ```bash
   sudo docker run --rm node:18-alpine apk update
   ```

### If services don't start

1. Check container status:
   ```bash
   sudo docker-compose ps
   ```

2. Check logs:
   ```bash
   sudo docker-compose logs backend
   sudo docker-compose logs frontend
   sudo docker-compose logs nginx
   ```

3. Restart specific service:
   ```bash
   sudo docker-compose restart frontend
   ```

## 📝 Notes

- The fix is committed and ready to deploy
- No code changes needed, just pull and rebuild
- Database initialization will happen automatically on first run
- SSL certificates should already be in place in nginx/ssl/

## 🎯 Success Criteria

- ✅ Docker build completes without errors
- ✅ All containers running (postgres, redis, backend, frontend, nginx)
- ✅ Application accessible at bitcorp.mohammadasjad.com
- ✅ All pages functional
- ✅ Login works for all user types (admin, developer, operator)

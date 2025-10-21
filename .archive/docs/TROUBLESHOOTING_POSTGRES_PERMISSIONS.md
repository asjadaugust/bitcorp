# PostgreSQL Permission Issues - Troubleshooting Guide

## Problem

When running `docker-compose up -d`, you see:

```
dependency failed to start: container bitcorp_postgres is unhealthy
```

With logs showing:
```
ls: can't open '/docker-entrypoint-initdb.d/': Permission denied
```

## Root Cause

The PostgreSQL container runs as user `postgres` (UID 999) and cannot read the mounted init-scripts directory from your Synology NAS due to permission restrictions.

## Solutions

### Solution 1: Comment Out Init Scripts (Recommended)

The init-scripts mount is **optional** and only needed if you have custom database initialization scripts.

**Steps:**

1. **Edit docker-compose.yml** (already done in updated version):
   ```yaml
   volumes:
     - postgres_data:/var/lib/postgresql/data
     # Commented out - only needed for custom init scripts
     # - /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts:/docker-entrypoint-initdb.d:ro
     - /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups:/backups
   ```

2. **Restart containers**:
   ```bash
   cd /volume1/docker/bitcorp
   docker-compose down
   docker-compose up -d
   ```

3. **Verify**:
   ```bash
   docker-compose ps
   # Should show all containers as healthy
   ```

### Solution 2: Fix Permissions (If You Need Init Scripts)

If you have custom initialization scripts in `kubernetes/init-scripts/`, use this method.

**Steps:**

1. **Run the fix script**:
   ```bash
   sudo bash /volume1/PeruFamilyDocs/BitCorp/bitcorp/scripts/fix-postgres-permissions.sh
   ```

2. **Uncomment the init-scripts volume** in docker-compose.yml:
   ```yaml
   - /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts:/docker-entrypoint-initdb.d:ro
   ```

3. **Restart PostgreSQL**:
   ```bash
   cd /volume1/docker/bitcorp
   docker-compose restart db
   ```

### Solution 3: Manual Permission Fix

**On your Synology NAS via SSH:**

```bash
# Fix init-scripts directory permissions
sudo mkdir -p /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts
sudo chmod -R 755 /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts
sudo chown -R 999:999 /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts

# Fix backup directory permissions
sudo mkdir -p /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups
sudo chmod -R 755 /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups
sudo chown -R 999:999 /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups

# Restart PostgreSQL
cd /volume1/docker/bitcorp
docker-compose restart db
```

## Understanding the Issue

### Why Does This Happen?

1. **Docker User Mapping**: PostgreSQL container runs as UID 999 (postgres user)
2. **Synology Permissions**: Directories created on Synology may have different ownership
3. **Read-Only Mount**: The `:ro` flag requires read permissions
4. **Alpine Linux**: PostgreSQL uses Alpine Linux which has strict permission checks

### Do You Need Init Scripts?

**You DON'T need init-scripts if:**
- ✅ You're using Alembic migrations (you are!)
- ✅ Database schema is managed by your application
- ✅ You don't have custom SQL scripts to run on first startup

**You DO need init-scripts if:**
- ❌ You have custom `.sql` or `.sh` files for database initialization
- ❌ You need to create specific extensions or configurations on startup
- ❌ You have seed data in SQL format (vs Python scripts)

## Verification Steps

### 1. Check Container Health

```bash
cd /volume1/docker/bitcorp
docker-compose ps
```

Expected output:
```
NAME                  STATUS
bitcorp_postgres      Up (healthy)
bitcorp_redis         Up (healthy)
bitcorp_backend       Up (healthy)
...
```

### 2. Check PostgreSQL Logs

```bash
docker-compose logs db
```

Should see:
```
PostgreSQL init process complete; ready for start up.
database system is ready to accept connections
```

### 3. Test Database Connection

```bash
docker-compose exec db psql -U bitcorp -d bitcorp_erp -c "SELECT version();"
```

Should return PostgreSQL version info.

### 4. Check Directory Permissions

**On Synology:**
```bash
ls -la /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/
```

Should show:
```
drwxr-xr-x ... 999 999 ... init-scripts
```

## Additional PostgreSQL Issues

### Issue: "could not translate host name to address"

**Solution**: Ensure database service is named `db` in docker-compose.yml and backend uses `db` as hostname.

### Issue: "database does not exist"

**Solution**: Run database migrations:
```bash
docker-compose exec backend alembic upgrade head
```

### Issue: "password authentication failed"

**Solution**: Check `.env` file - ensure `POSTGRES_PASSWORD` matches between database and backend settings.

## Redis Warnings (Non-Critical)

You may also see Redis warnings:
```
WARNING Memory overcommit must be enabled!
WARNING: The TCP backlog setting of 511 cannot be enforced
```

These are **warnings only** and won't prevent Redis from working. To fix them on Synology:

```bash
# Add to /etc/sysctl.conf
sudo nano /etc/sysctl.conf

# Add these lines:
vm.overcommit_memory = 1
net.core.somaxconn = 511

# Apply changes
sudo sysctl -p
```

## Quick Restart Procedure

If containers are unhealthy:

```bash
cd /volume1/docker/bitcorp

# Stop all containers
docker-compose down

# (Optional) Remove volumes if you want fresh start
# WARNING: This deletes all data!
# docker-compose down -v

# Start containers
docker-compose up -d

# Watch logs
docker-compose logs -f

# Check health (in another terminal)
docker-compose ps
```

## When to Seek Further Help

If after trying all solutions you still have issues:

1. **Collect Information**:
   ```bash
   # Get Docker version
   docker --version
   docker-compose --version
   
   # Get container status
   docker-compose ps
   
   # Get full logs
   docker-compose logs > /tmp/bitcorp-logs.txt
   
   # Get system info
   uname -a
   ```

2. **Check File Locations**:
   ```bash
   ls -la /volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts/
   ls -la /volume1/docker/bitcorp/
   ```

3. **Report Issue** with:
   - Synology DSM version
   - Docker version
   - Complete logs
   - Permission output from above commands

## Prevention

For future deployments:

1. **Use the Updated docker-compose.synology.yml**: Init-scripts are commented out by default
2. **Run Setup Script**: The `setup-synology.sh` script now creates directories with correct permissions
3. **Document Custom Scripts**: If you add init scripts, document which ones and why

## Related Files

- **Fix Script**: `/volume1/PeruFamilyDocs/BitCorp/bitcorp/scripts/fix-postgres-permissions.sh`
- **Docker Compose**: `/volume1/docker/bitcorp/docker-compose.yml`
- **Environment**: `/volume1/docker/bitcorp/.env`
- **Deployment Guide**: `docs/SYNOLOGY_DEPLOYMENT_GUIDE.md`

---

**Last Updated**: October 2025  
**Issue**: PostgreSQL Permission Denied  
**Status**: Resolved - Init scripts commented out by default

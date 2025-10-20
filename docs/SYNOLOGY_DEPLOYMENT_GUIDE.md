# Bitcorp ERP - Synology NAS Deployment Guide

## 📋 Overview

This guide walks you through deploying the Bitcorp ERP application on a Synology NAS using Docker Compose. The application will run in Docker containers with persistent data storage on your Synology volumes.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Synology NAS (DSM)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /volume1/docker/bitcorp/          (Runtime location)      │
│    ├── docker-compose.yml                                  │
│    └── .env                                                 │
│                                                             │
│  /volume1/PeruFamilyDocs/BitCorp/bitcorp/ (Codebase)      │
│    ├── backend/                                            │
│    ├── frontend/                                           │
│    ├── database/                                           │
│    └── ...                                                  │
│                                                             │
│  Docker Containers:                                        │
│    ├── bitcorp_postgres    (Database)                     │
│    ├── bitcorp_redis       (Cache/Queue)                  │
│    ├── bitcorp_backend     (FastAPI)                      │
│    ├── bitcorp_celery_worker (Async tasks)               │
│    ├── bitcorp_celery_beat   (Scheduler)                 │
│    ├── bitcorp_frontend    (Next.js)                      │
│    └── bitcorp_pgadmin     (DB Management)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

### Synology Requirements
- **DSM Version**: 7.0 or higher
- **RAM**: Minimum 8GB (16GB recommended)
- **CPU**: Quad-core processor or better
- **Storage**: Minimum 50GB free space
- **Docker Package**: Installed from Package Center

### Network Requirements
- Static IP address or DDNS setup
- Ports available: 3000, 8000, 5433, 6379, 5050
- Firewall configured to allow access

## 🚀 Installation Steps

### Step 1: Enable Docker on Synology

1. Open **DSM** and log in as administrator
2. Go to **Package Center**
3. Search for **Docker**
4. Click **Install** and wait for completion
5. Open **Docker** app to verify installation

### Step 2: Prepare Directory Structure

SSH into your Synology NAS or use **File Station**:

```bash
# SSH into Synology
ssh admin@your-synology-ip

# Create runtime directory
sudo mkdir -p /volume1/docker/bitcorp

# Verify codebase location
ls -la /volume1/PeruFamilyDocs/BitCorp/bitcorp

# Create required directories
sudo mkdir -p /volume1/PeruFamilyDocs/BitCorp/bitcorp/backend/logs
sudo mkdir -p /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups

# Set permissions (adjust UID/GID if needed)
sudo chown -R 1000:1000 /volume1/PeruFamilyDocs/BitCorp/bitcorp/backend/logs
sudo chown -R 1000:1000 /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups
```

### Step 3: Configure Environment Variables

1. Copy the environment file:
```bash
cd /volume1/docker/bitcorp
cp /volume1/PeruFamilyDocs/BitCorp/bitcorp/.env.synology.example .env
```

2. Edit the `.env` file:
```bash
sudo nano .env
```

3. **CRITICAL**: Change these values:
   - `POSTGRES_PASSWORD` - Generate secure password
   - `REDIS_PASSWORD` - Generate secure password
   - `SECRET_KEY` - Generate with `openssl rand -hex 64`
   - `PGADMIN_PASSWORD` - Generate secure password
   - `NEXT_PUBLIC_API_URL` - Set to your Synology IP (e.g., `http://192.168.1.100:8000`)

4. Generate secure passwords:
```bash
# PostgreSQL password
openssl rand -base64 32

# Redis password
openssl rand -base64 32

# JWT secret key
openssl rand -hex 64
```

### Step 4: Copy Docker Compose File

```bash
cd /volume1/docker/bitcorp
cp /volume1/PeruFamilyDocs/BitCorp/bitcorp/docker-compose.synology.yml docker-compose.yml
```

### Step 5: Configure Firewall (Optional but Recommended)

1. Go to **Control Panel** > **Security** > **Firewall**
2. Select your firewall profile and click **Edit Rules**
3. Click **Create** and add rules:

| Port | Protocol | Source IP | Action |
|------|----------|-----------|--------|
| 3000 | TCP | Your local network | Allow |
| 8000 | TCP | Your local network | Allow |
| 5433 | TCP | 127.0.0.1 only | Allow |
| 6379 | TCP | 127.0.0.1 only | Allow |
| 5050 | TCP | Your local network | Allow |

### Step 6: Deploy Application

```bash
cd /volume1/docker/bitcorp

# Pull base images
sudo docker-compose pull

# Build custom images (backend/frontend)
sudo docker-compose build --no-cache

# Start all services
sudo docker-compose up -d

# Monitor startup logs
sudo docker-compose logs -f
```

**Wait 2-3 minutes** for all services to start. Watch for:
- ✅ Database initialized
- ✅ Redis ready
- ✅ Backend API started
- ✅ Frontend compiled

Press `Ctrl+C` to stop following logs.

### Step 7: Verify Deployment

```bash
# Check container status
sudo docker-compose ps

# All containers should show "Up (healthy)"

# Check specific service logs
sudo docker-compose logs backend
sudo docker-compose logs frontend
```

Expected output:
```
NAME                  IMAGE                  STATUS          PORTS
bitcorp_postgres      postgres:15-alpine     Up (healthy)    0.0.0.0:5433->5432/tcp
bitcorp_redis         redis:7-alpine         Up (healthy)    0.0.0.0:6379->6379/tcp
bitcorp_backend       bitcorp_backend        Up (healthy)    0.0.0.0:8000->8000/tcp
bitcorp_celery_worker bitcorp_backend        Up              
bitcorp_celery_beat   bitcorp_backend        Up              
bitcorp_frontend      bitcorp_frontend       Up (healthy)    0.0.0.0:3000->3000/tcp
bitcorp_pgadmin       dpage/pgadmin4         Up              0.0.0.0:5050->80/tcp
```

### Step 8: Initialize Database

```bash
# Run database migrations
sudo docker-compose exec backend alembic upgrade head

# Seed initial data (if seed script exists)
sudo docker-compose exec backend python scripts/seed_data.py
```

### Step 9: Access Application

Open your browser and navigate to:

- **Frontend**: http://your-synology-ip:3000
- **Backend API Docs**: http://your-synology-ip:8000/docs
- **pgAdmin**: http://your-synology-ip:5050

**Test credentials** (from seeded data):
- Operator: `john.operator` / `operator123`
- Admin: (check seed_data.py for admin credentials)

## 🔧 Synology Docker UI Configuration (Alternative Method)

If you prefer using Synology's Docker GUI:

### Import via Docker UI

1. Open **Docker** app in DSM
2. Go to **Project** tab
3. Click **Create**
4. Set **Project Name**: `bitcorp`
5. Set **Path**: `/docker/bitcorp`
6. Docker Compose will automatically detect `docker-compose.yml`
7. Click **Create** to start

### Manage Containers

1. Go to **Container** tab to see all services
2. Select a container and click **Details** for logs
3. Use **Action** menu to start/stop/restart
4. Go to **Log** tab for troubleshooting

## 🔐 Security Hardening

### 1. Disable pgAdmin in Production

Edit `docker-compose.yml` and comment out pgAdmin service:

```yaml
#  pgadmin:
#    image: dpage/pgadmin4:latest
#    ...
```

Recreate containers:
```bash
sudo docker-compose up -d
```

### 2. Restrict Database/Redis to Localhost Only

Edit `docker-compose.yml` ports section:

```yaml
ports:
  - "127.0.0.1:5433:5432"  # Only accessible from localhost
  - "127.0.0.1:6379:6379"  # Only accessible from localhost
```

### 3. Enable HTTPS with Reverse Proxy

1. Go to **Control Panel** > **Login Portal** > **Advanced** > **Reverse Proxy**
2. Click **Create** and configure:

**Frontend Reverse Proxy:**
```
Description: Bitcorp Frontend
Source Protocol: HTTPS
Source Hostname: bitcorp.yourdomain.com
Source Port: 443

Destination Protocol: HTTP
Destination Hostname: localhost
Destination Port: 3000

Certificate: (Select Let's Encrypt certificate)
```

**Backend Reverse Proxy:**
```
Description: Bitcorp API
Source Protocol: HTTPS
Source Hostname: api.bitcorp.yourdomain.com
Source Port: 443

Destination Protocol: HTTP
Destination Hostname: localhost
Destination Port: 8000

Certificate: (Select Let's Encrypt certificate)
```

3. Update `.env` file:
```bash
NEXT_PUBLIC_API_URL=https://api.bitcorp.yourdomain.com
```

4. Restart containers:
```bash
sudo docker-compose restart frontend
```

### 4. Configure Let's Encrypt Certificate

1. Go to **Control Panel** > **Security** > **Certificate**
2. Click **Add** > **Add a new certificate**
3. Select **Get a certificate from Let's Encrypt**
4. Enter your domain name
5. Enable certificate auto-renewal

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
sudo docker-compose logs -f

# Specific service
sudo docker-compose logs -f backend

# Last 100 lines
sudo docker-compose logs --tail=100 backend

# Follow logs from specific time
sudo docker-compose logs -f --since 30m backend
```

### Check Resource Usage

```bash
# Container stats
sudo docker stats

# Disk usage
sudo docker system df
```

In DSM Docker app:
- Go to **Container** tab
- Select container and view **Resource** tab
- Monitor CPU, Memory, Network usage

### Health Checks

```bash
# Check all services health
sudo docker-compose ps

# Test backend API
curl http://localhost:8000/health

# Test frontend
curl http://localhost:3000

# Test database connection
sudo docker-compose exec db psql -U bitcorp -d bitcorp_erp -c "SELECT version();"
```

### Backup Database

**Manual Backup:**
```bash
# Create backup
sudo docker-compose exec db pg_dump -U bitcorp bitcorp_erp > /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups/backup_*.sql
```

**Automated Backup (Synology Task Scheduler):**

1. Go to **Control Panel** > **Task Scheduler**
2. Click **Create** > **Scheduled Task** > **User-defined script**
3. Configure:
   - **Task**: Bitcorp Database Backup
   - **User**: root
   - **Schedule**: Daily at 2:00 AM
   - **User-defined script**:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   docker exec bitcorp_postgres pg_dump -U bitcorp bitcorp_erp | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
   
   # Keep only last 30 days of backups
   find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
   ```

4. Click **OK** and enable the task

**Restore Database:**
```bash
# Stop backend services
sudo docker-compose stop backend celery_worker celery_beat

# Restore from backup
gunzip < /volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups/backup_YYYYMMDD_HHMMSS.sql.gz | \
  sudo docker-compose exec -T db psql -U bitcorp bitcorp_erp

# Start services
sudo docker-compose start backend celery_worker celery_beat
```

### Update Application

```bash
cd /volume1/docker/bitcorp

# Pull latest code (if using Git on Synology)
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
git pull origin main

# Return to runtime directory
cd /volume1/docker/bitcorp

# Rebuild and restart
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Run migrations if needed
sudo docker-compose exec backend alembic upgrade head

# Check logs
sudo docker-compose logs -f
```

### Restart Services

```bash
# Restart all services
sudo docker-compose restart

# Restart specific service
sudo docker-compose restart backend

# Stop all services
sudo docker-compose stop

# Start all services
sudo docker-compose start

# Stop and remove containers (data preserved in volumes)
sudo docker-compose down

# Start from scratch
sudo docker-compose up -d
```

## 🐛 Troubleshooting

### Issue: Containers Won't Start

**Symptoms**: `docker-compose ps` shows containers as "Restarting" or "Exited"

**Solution**:
```bash
# Check logs for errors
sudo docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for db health check
# 2. Port conflicts - change ports in .env
# 3. Permission errors - check directory permissions
```

### Issue: Database Connection Failed

**Symptoms**: Backend logs show "could not connect to server"

**Solution**:
```bash
# Check database is healthy
sudo docker-compose ps db

# Verify database credentials in .env match docker-compose.yml
# Test connection manually
sudo docker-compose exec db psql -U bitcorp -d bitcorp_erp

# Check network connectivity
sudo docker-compose exec backend ping db
```

### Issue: Frontend Can't Connect to Backend

**Symptoms**: Frontend shows API errors or timeout

**Solution**:
```bash
# Check backend is running
sudo docker-compose logs backend | grep "Uvicorn running"

# Verify NEXT_PUBLIC_API_URL in .env
# Should be: http://backend:8000 (for container-to-container)
# Or: http://your-synology-ip:8000 (for browser access)

# Test API from Synology
curl http://localhost:8000/health

# Check CORS settings in backend/app/core/config.py
```

### Issue: Permission Denied Errors

**Symptoms**: Logs show "Permission denied" when accessing files

**Solution**:
```bash
# Check directory ownership
ls -la /volume1/PeruFamilyDocs/BitCorp/bitcorp/backend/logs

# Fix permissions (replace 1000:1000 with your user:group)
sudo chown -R 1000:1000 /volume1/PeruFamilyDocs/BitCorp/bitcorp/backend/logs
sudo chmod -R 755 /volume1/PeruFamilyDocs/BitCorp/bitcorp/backend/logs
```

### Issue: Out of Memory

**Symptoms**: Containers killed, "OOM" in logs

**Solution**:
```bash
# Check Docker resource limits in DSM
# Control Panel > Docker > Settings > Resources

# Increase Docker memory allocation to at least 4GB

# Reduce container resources in docker-compose.yml:
# Add to services:
#   deploy:
#     resources:
#       limits:
#         memory: 512M

# Restart containers
sudo docker-compose restart
```

### Issue: Port Already in Use

**Symptoms**: "bind: address already in use" error

**Solution**:
```bash
# Check what's using the port
sudo netstat -tulpn | grep :8000

# Change ports in .env file:
BACKEND_PORT=8001
FRONTEND_PORT=3001
POSTGRES_PORT=5434

# Restart containers
sudo docker-compose down
sudo docker-compose up -d
```

## 📱 Accessing from Mobile Devices

### Local Network Access

1. Find your Synology IP: `192.168.1.100` (example)
2. On mobile browser, navigate to: `http://192.168.1.100:3000`
3. Bookmark for easy access

### Internet Access (via DDNS)

1. Set up Synology DDNS:
   - **Control Panel** > **External Access** > **DDNS**
   - Register a hostname: `mynas.synology.me`

2. Configure port forwarding on router:
   - Forward port 3000 to Synology IP
   - Forward port 8000 to Synology IP

3. Access via: `http://mynas.synology.me:3000`

### Secure Access (Recommended)

1. Use Synology VPN Server:
   - Install **VPN Server** from Package Center
   - Configure OpenVPN or L2TP/IPSec
   - Connect to VPN from mobile device
   - Access via internal IP: `http://192.168.1.100:3000`

2. Or use reverse proxy with HTTPS (see Security Hardening section)

## 🔄 CI/CD Integration (Advanced)

### Automated Deployment from GitHub

1. Create deploy key on Synology:
```bash
ssh-keygen -t ed25519 -C "bitcorp-deploy"
cat ~/.ssh/id_ed25519.pub
```

2. Add public key to GitHub repository:
   - **Settings** > **Deploy keys** > **Add deploy key**

3. Create deployment script:
```bash
sudo nano /volume1/docker/bitcorp/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting Bitcorp ERP deployment..."

# Pull latest code
cd /volume1/PeruFamilyDocs/BitCorp/bitcorp
git pull origin main

# Build and restart
cd /volume1/docker/bitcorp
docker-compose build --no-cache backend frontend
docker-compose up -d

# Run migrations
docker-compose exec -T backend alembic upgrade head

# Health check
sleep 10
curl -f http://localhost:8000/health || exit 1
curl -f http://localhost:3000 || exit 1

echo "✅ Deployment completed successfully!"
```

4. Make executable:
```bash
sudo chmod +x /volume1/docker/bitcorp/deploy.sh
```

5. Create webhook endpoint (requires additional setup)

## 📚 Additional Resources

### Docker & Compose
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Synology Docker Guide](https://www.synology.com/en-global/dsm/packages/Docker)

### FastAPI
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Deployment Guide](https://fastapi.tiangolo.com/deployment/)

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Deployment](https://nextjs.org/docs/deployment)

### PostgreSQL
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Books (in `/books` folder)
- "Designing Data-Intensive Applications" - System architecture
- "Clean Code in Python" - Python best practices
- "API Design Patterns" - REST API design

## 🆘 Support

### Get Help

1. Check logs: `sudo docker-compose logs -f`
2. Verify configuration: `sudo docker-compose config`
3. Search issues: [GitHub Issues](https://github.com/asjadaugust/bitcorp/issues)
4. Review documentation in `/docs` folder

### Report Issues

When reporting issues, include:
- DSM version
- Docker version (`docker --version`)
- Output of `docker-compose ps`
- Relevant logs (`docker-compose logs backend`)
- Steps to reproduce

## 📝 Maintenance Checklist

### Daily
- [ ] Monitor Docker app for container health
- [ ] Check disk space usage

### Weekly
- [ ] Review container logs for errors
- [ ] Verify backups are running
- [ ] Test application functionality

### Monthly
- [ ] Update Docker images: `docker-compose pull`
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Update SSL certificates (if not auto-renewing)

### Quarterly
- [ ] Update DSM to latest version
- [ ] Update Docker to latest version
- [ ] Security audit (credentials, firewall, access logs)
- [ ] Performance review and optimization

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: asjadaugust

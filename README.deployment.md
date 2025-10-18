# Bitcorp ERP - Simplified Production Deployment Guide

## 🎯 Overview

This simplified deployment requires only **Docker** and **Docker Compose** - no Node.js, Python, or development tools needed on the host machine.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 20GB disk space
- Available ports: 3000, 8000 (configurable)

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.production.example .env.production

# Edit with your settings
nano .env.production
```

**Required changes:**
- `POSTGRES_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password
- `SECRET_KEY` - 32+ character secret key for JWT
- `NEXT_PUBLIC_API_URL` - Your server's public URL (e.g., http://YOUR_IP:8000)
- `BACKEND_CORS_ORIGINS` - Add your domain/IP

**Optional port changes (if ports are in use):**
- `FRONTEND_PORT` - Default: 3000
- `BACKEND_PORT` - Default: 8000
- `PGADMIN_PORT` - Default: 5050

### 2. Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The deployment will:
1. Build optimized Docker images
2. Start all services (database, cache, backend, frontend)
3. Run database migrations
4. Display access URLs

### 3. Access Application

- **Frontend**: http://YOUR_SERVER_IP:3000
- **Backend API**: http://YOUR_SERVER_IP:8000
- **API Documentation**: http://YOUR_SERVER_IP:8000/docs
- **pgAdmin** (if enabled): http://YOUR_SERVER_IP:5050

## 🔧 Management Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.prod.yml restart

# Specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update and Redeploy
```bash
./deploy.sh
```

### Check Service Health
```bash
docker-compose -f docker-compose.prod.yml ps
```

## 💾 Backup & Restore

### Create Backup
```bash
# Make backup script executable
chmod +x backup/backup.sh

# Run backup
./backup/backup.sh
```

Backups are stored in `./backups/` directory and include:
- PostgreSQL database
- Redis data
- Uploaded files

### Restore from Backup
```bash
# Restore database
gunzip -c backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i bitcorp-db psql -U bitcorp bitcorp_erp

# Restore Redis
docker cp backups/redis_backup_YYYYMMDD_HHMMSS.rdb bitcorp-redis:/data/dump.rdb
docker-compose -f docker-compose.prod.yml restart redis

# Restore uploads
docker run --rm -v bitcorp_upload_data:/data -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads_YYYYMMDD_HHMMSS.tar.gz -C /data
```

## 🖥️ Synology NAS Deployment

### Method 1: Container Manager (GUI)

1. Open **Container Manager** in DSM
2. Go to **Project** tab
3. Click **Create**
4. Upload or paste `docker-compose.prod.yml`
5. Configure environment variables in the UI
6. Click **Build and Deploy**

### Method 2: SSH (Command Line)

```bash
# Connect to your Synology NAS
ssh admin@YOUR_SYNOLOGY_IP -p 2230

# Create deployment directory
mkdir -p /volume1/docker/bitcorp
cd /volume1/docker/bitcorp

# Upload files (from your local machine)
scp -P 2230 -r ./* admin@YOUR_SYNOLOGY_IP:/volume1/docker/bitcorp/

# Deploy
sudo ./deploy.sh
```

## 🔐 Security Recommendations

1. **Change Default Passwords**
   - Update all passwords in `.env.production`
   - Use strong passwords (20+ characters)
   - Never use default credentials in production

2. **Secure Secret Keys**
   - Generate strong SECRET_KEY: `openssl rand -hex 32`
   - Keep `.env.production` secure (never commit to git)

3. **Configure Firewall**
   - Limit access to ports 3000, 8000 to trusted IPs
   - Use reverse proxy (Nginx) for SSL/HTTPS

4. **Regular Updates**
   - Keep Docker images updated
   - Monitor security advisories
   - Apply updates promptly

5. **Backup Strategy**
   - Schedule automated backups (cron job)
   - Store backups off-site
   - Test restore procedures regularly

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs backend
```

### Port Already in Use

Edit `.env.production` and change port numbers:
```bash
FRONTEND_PORT=3001
BACKEND_PORT=8001
```

### Database Connection Errors

```bash
# Check database health
docker exec bitcorp-db pg_isready -U bitcorp

# View database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### Reset Everything

```bash
# Stop and remove all containers and volumes
docker-compose -f docker-compose.prod.yml down -v

# Redeploy
./deploy.sh
```

### Check Service Health

```bash
# Backend health check
curl http://localhost:8000/api/v1/health

# Frontend health check
curl http://localhost:3000
```

## 📊 Performance Tuning

### For Synology NAS

Add resource limits to `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          memory: 512M
```

### Database Optimization

Increase PostgreSQL resources if needed:

```yaml
postgres:
  command: postgres -c shared_buffers=256MB -c max_connections=100
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code (if using git)
git pull

# Rebuild and redeploy
./deploy.sh
```

### View Resource Usage

```bash
docker stats
```

### Clean Up Old Images

```bash
docker system prune -a
```

## 📞 Support

For issues or questions:
- Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Review documentation in `/docs` directory
- Check health endpoints: `/api/v1/health`

## 🎉 Success Checklist

- [ ] All services show as "healthy" in `docker ps`
- [ ] Frontend loads at http://YOUR_IP:3000
- [ ] Backend API responds at http://YOUR_IP:8000/docs
- [ ] Can login with default credentials
- [ ] Database backups are configured
- [ ] Passwords have been changed from defaults
- [ ] Firewall rules are configured

**Your Bitcorp ERP is ready for production!** 🚀

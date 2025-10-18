# Bitcorp ERP - Manual Deployment to mohammadasjad.com

## Quick Deployment Steps

### Step 1: Create deployment directory on remote server

```bash
ssh -p 2230 mohammad@mohammadasjad.com
mkdir -p ~/bitcorp-erp
cd ~/bitcorp-erp
```

### Step 2: Upload files from local machine

From your local machine, run:

```bash
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp

# Create a deployment tar
tar czf bitcorp-deploy.tar.gz \
    docker/ \
    backend/ \
    frontend/ \
    docker-compose.prod.yml \
    .env.production \
    deploy.sh \
    README.deployment.md

# Upload to server
scp -P 2230 bitcorp-deploy.tar.gz mohammad@mohammadasjad.com:~/bitcorp-erp/
```

### Step 3: Extract and deploy on server

```bash
ssh -p 2230 mohammad@mohammadasjad.com

cd ~/bitcorp-erp
tar xzf bitcorp-deploy.tar.gz

# Verify Docker is running
docker --version
docker-compose --version

# Start deployment
chmod +x deploy.sh
./deploy.sh
```

### Step 4: Monitor deployment

```bash
# Watch logs
docker-compose -f docker-compose.prod.yml logs -f

# Check status
docker-compose -f docker-compose.prod.yml ps

# View individual service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## Access URLs

Once deployed, access at:

- **Frontend**: http://mohammadasjad.com:30000
- **Backend API**: http://mohammadasjad.com:30001
- **API Docs**: http://mohammadasjad.com:30001/docs
- **pgAdmin**: http://mohammadasjad.com:30002

## Port Configuration

The deployment uses the following ports (all verified as available):
- Frontend: 30000
- Backend: 30001
- pgAdmin: 30002
- PostgreSQL: Internal (5432 inside Docker network)
- Redis: Internal (6379 inside Docker network)

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these immediately after first login!**

## Management Commands

```bash
# SSH to server
ssh -p 2230 mohammad@mohammadasjad.com
cd ~/bitcorp-erp

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update deployment
./deploy.sh

# Backup database
chmod +x backup/backup.sh
./backup/backup.sh

# Check service health
docker-compose -f docker-compose.prod.yml ps
curl http://localhost:30001/api/v1/health
```

## Troubleshooting

### Issue: Cannot connect to frontend

Check if the service is running:
```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs frontend
```

### Issue: Backend returns 502/503

Wait for health checks to pass (can take 30-60 seconds):
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Issue: Database connection errors

Check PostgreSQL is healthy:
```bash
docker exec bitcorp-db pg_isready -U bitcorp
```

### Issue: Port already in use

If ports 30000-30002 become unavailable, edit `.env.production`:
```bash
nano .env.production
# Change FRONTEND_PORT, BACKEND_PORT, PGADMIN_PORT
# Then restart: docker-compose -f docker-compose.prod.yml up -d
```

## Firewall Configuration (if needed)

If you can't access the ports externally, you may need to configure your Synology firewall:

1. Open **Control Panel** > **Security** > **Firewall**
2. Add rules for ports 30000, 30001, 30002
3. Allow TCP connections from trusted IPs

## Production Checklist

- [ ] Deploy services successfully
- [ ] Access frontend at port 30000
- [ ] Access backend at port 30001
- [ ] Login with default credentials works
- [ ] Change admin password
- [ ] Update .env.production with strong passwords
- [ ] Configure firewall rules
- [ ] Set up automatic backups (cron job)
- [ ] Test backup and restore procedure

## Automated Backup Setup

Create a cron job for daily backups:

```bash
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd ~/bitcorp-erp && ./backup/backup.sh >> ~/bitcorp-backups.log 2>&1
```

## Update Procedure

When you need to update the application:

```bash
# On your local machine
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
git pull  # Get latest changes

# Create new deployment package
tar czf bitcorp-deploy.tar.gz docker/ backend/ frontend/ docker-compose.prod.yml .env.production deploy.sh

# Upload to server
scp -P 2230 bitcorp-deploy.tar.gz mohammad@mohammadasjad.com:~/bitcorp-erp/

# On remote server
ssh -p 2230 mohammad@mohammadasjad.com
cd ~/bitcorp-erp
./backup/backup.sh  # Backup before update
tar xzf bitcorp-deploy.tar.gz
./deploy.sh  # Rebuild and restart
```

## Support

For issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify all services are healthy: `docker-compose -f docker-compose.prod.yml ps`
3. Check backend health: `curl http://localhost:30001/api/v1/health`
4. Review README.deployment.md for detailed troubleshooting

---

**Deployment simplified - From 15+ steps to just 3 commands!** 🚀

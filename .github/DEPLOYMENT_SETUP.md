# GitHub Actions Deployment Setup Guide

This guide explains how to configure automated deployment to your Synology NAS using GitHub Actions.

## Prerequisites

1. GitHub repository with the Bitcorp ERP code
2. Synology NAS with SSH access enabled
3. Docker installed on Synology NAS

## Step 1: Generate SSH Key for GitHub Actions

On your local machine, generate a new SSH key pair for GitHub Actions:

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@bitcorp" -f ~/.ssh/bitcorp-deploy
```

This creates two files:
- `~/.ssh/bitcorp-deploy` (private key - for GitHub Secrets)
- `~/.ssh/bitcorp-deploy.pub` (public key - for Synology NAS)

## Step 2: Add Public Key to Synology NAS

1. Copy the public key to your Synology NAS:

```bash
ssh-copy-id -i ~/.ssh/bitcorp-deploy.pub -p 2230 mohammad@mohammadasjad.com
```

2. Or manually add it:

```bash
# SSH to your NAS
ssh -p 2230 mohammad@mohammadasjad.com

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste your public key here]
EOF

chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SYNOLOGY_SSH_KEY` | Private SSH key content | Content of `~/.ssh/bitcorp-deploy` |
| `SYNOLOGY_USER` | SSH username | `mohammad` |
| `SYNOLOGY_HOST` | Synology hostname or IP | `mohammadasjad.com` or `192.168.0.13` |
| `SYNOLOGY_SSH_PORT` | SSH port number | `2230` |
| `SYNOLOGY_DEPLOY_PATH` | Deployment directory on NAS | `/volume1/docker/bitcorp-erp` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `your-secure-db-password` |
| `REDIS_PASSWORD` | Redis password | `your-secure-redis-password` |
| `JWT_SECRET_KEY` | JWT signing key | `your-64-char-secret-key` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://mohammadasjad.com:20080` |
| `FRONTEND_PORT` | Frontend port on NAS | `20081` |
| `BACKEND_PORT` | Backend port on NAS | `20080` |

### How to Add SSH Key Secret

1. Copy the ENTIRE contents of your private key:

```bash
cat ~/.ssh/bitcorp-deploy | pbcopy  # macOS
# or
cat ~/.ssh/bitcorp-deploy | xclip -selection clipboard  # Linux
```

2. In GitHub Secrets, paste it as `SYNOLOGY_SSH_KEY`

## Step 4: Update docker-compose.prod.yml Ports

Update the ports in `docker-compose.prod.yml` to match available ports:

```yaml
services:
  backend:
    ports:
      - "20080:8000"  # External:Internal
  
  frontend:
    ports:
      - "20081:3000"
  
  postgres:
    ports:
      - "20082:5432"
  
  redis:
    ports:
      - "20083:6379"
  
  pgadmin:
    ports:
      - "20084:80"
```

## Step 5: Prepare Synology NAS

1. **Install Docker** (if not already installed):
   - Open Package Center
   - Search for "Docker"
   - Click Install

2. **Create deployment directory**:

```bash
ssh -p 2230 mohammad@mohammadasjad.com
mkdir -p /volume1/docker/bitcorp-erp
cd /volume1/docker/bitcorp-erp
```

3. **Verify Docker is accessible**:

```bash
docker --version
docker-compose --version
```

## Step 6: Enable GitHub Container Registry

GitHub Actions will push Docker images to GitHub Container Registry (ghcr.io).

1. Create a Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with these scopes:
     - `write:packages`
     - `read:packages`
     - `delete:packages`

2. The workflow automatically uses `GITHUB_TOKEN` for registry access

## Step 7: Trigger Deployment

### Automatic Deployment
Push to `main` branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Manual Deployment
1. Go to GitHub repository → Actions
2. Select "Deploy to Synology NAS" workflow
3. Click "Run workflow" → Select branch → "Run workflow"

## Step 8: Monitor Deployment

1. **GitHub Actions UI**:
   - Go to Actions tab
   - Click on the running workflow
   - Monitor each step

2. **Check deployment status on NAS**:

```bash
ssh -p 2230 mohammad@mohammadasjad.com
cd /volume1/docker/bitcorp-erp
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 9: Access Your Application

After successful deployment:

- **Frontend**: `http://mohammadasjad.com:20081`
- **Backend API**: `http://mohammadasjad.com:20080`
- **API Docs**: `http://mohammadasjad.com:20080/docs`
- **pgAdmin**: `http://mohammadasjad.com:20084`

## Troubleshooting

### SSH Connection Failed

```bash
# Test SSH connection manually
ssh -p 2230 mohammad@mohammadasjad.com -i ~/.ssh/bitcorp-deploy

# Check SSH key permissions
chmod 600 ~/.ssh/bitcorp-deploy
chmod 644 ~/.ssh/bitcorp-deploy.pub
```

### Docker Permission Issues on Synology

Add your user to docker group:

```bash
sudo synogroup --add docker mohammad
```

Logout and login again.

### Ports Already in Use

Check what's using ports:

```bash
sudo netstat -tlnp | grep 20080
```

Stop conflicting services or choose different ports.

### Container Health Check Failed

```bash
# Check container logs
docker logs bitcorp-backend
docker logs bitcorp-frontend

# Check container status
docker ps -a

# Restart containers
cd /volume1/docker/bitcorp-erp
docker-compose -f docker-compose.prod.yml restart
```

### Database Migration Issues

```bash
# Run migrations manually
docker exec bitcorp-backend alembic upgrade head
```

## Rollback Procedure

If deployment fails, rollback to previous version:

```bash
ssh -p 2230 mohammad@mohammadasjad.com
cd /volume1/docker/bitcorp-erp

# Use previous image tag
docker-compose -f docker-compose.prod.yml down
# Edit docker-compose.prod.yml to use previous image tag
docker-compose -f docker-compose.prod.yml up -d
```

## Security Best Practices

1. ✅ Use strong passwords for all secrets
2. ✅ Rotate secrets regularly
3. ✅ Use separate SSH key for CI/CD (don't reuse personal keys)
4. ✅ Limit SSH key permissions on NAS
5. ✅ Enable firewall rules to restrict port access
6. ✅ Use HTTPS with SSL certificates for production
7. ✅ Regularly update Docker images

## Maintenance

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Updating Application

Just push to main branch - GitHub Actions handles everything!

```bash
git push origin main
```

### Manual Updates

```bash
ssh -p 2230 mohammad@mohammadasjad.com
cd /volume1/docker/bitcorp-erp

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Remove old images
docker image prune -f
```

### Backup Database

```bash
# Create backup script
cat > /volume1/docker/bitcorp-erp/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/volume1/docker/bitcorp-erp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec bitcorp-db pg_dump -U bitcorp bitcorp_erp | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
EOF

chmod +x /volume1/docker/bitcorp-erp/backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /volume1/docker/bitcorp-erp/backup.sh
```

## Support

For issues with:
- **GitHub Actions**: Check workflow logs in Actions tab
- **Synology SSH**: Check DSM logs in Control Panel → Log Center
- **Docker containers**: Use `docker logs <container-name>`
- **Application issues**: Check application logs in container

## Next Steps

Once deployment is working:
1. Set up SSL certificates with Let's Encrypt
2. Configure domain name
3. Enable monitoring with Prometheus/Grafana
4. Set up automated backups
5. Configure log aggregation

# Quick Start - GitHub Actions Deployment

## Setup (One-Time Only)

### 1. Generate SSH Key

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/bitcorp-deploy
ssh-copy-id -i ~/.ssh/bitcorp-deploy.pub -p 2230 mohammad@mohammadasjad.com
```

### 2. Add GitHub Secrets

Go to: **Repository → Settings → Secrets → Actions → New repository secret**

```plaintext
SYNOLOGY_SSH_KEY     = (contents of ~/.ssh/bitcorp-deploy)
SYNOLOGY_USER        = mohammad
SYNOLOGY_HOST        = mohammadasjad.com
SYNOLOGY_SSH_PORT    = 2230
SYNOLOGY_DEPLOY_PATH = /volume1/docker/bitcorp-erp
POSTGRES_PASSWORD    = your-secure-db-password
REDIS_PASSWORD       = your-secure-redis-password
JWT_SECRET_KEY       = (run: openssl rand -base64 48)
NEXT_PUBLIC_API_URL  = http://mohammadasjad.com:20080
FRONTEND_PORT        = 20081
BACKEND_PORT         = 20080
```

### 3. Prepare Synology NAS

```bash
ssh -p 2230 mohammad@mohammadasjad.com
mkdir -p /volume1/docker/bitcorp-erp
sudo synogroup --add docker mohammad
exit
```

## Deploy

```bash
# Push to trigger deployment
git push origin main
```

## Access

- Frontend: <http://mohammadasjad.com:20081>
- Backend: <http://mohammadasjad.com:20080/docs>

## Monitor

- **GitHub**: Actions tab → Deploy workflow
- **NAS**: `ssh -p 2230 mohammad@mohammadasjad.com "cd /volume1/docker/bitcorp-erp && docker-compose ps"`

## Troubleshoot

```bash
# View logs
ssh -p 2230 mohammad@mohammadasjad.com
cd /volume1/docker/bitcorp-erp
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart
```

---

**See `.github/DEPLOYMENT_SETUP.md` for complete guide**

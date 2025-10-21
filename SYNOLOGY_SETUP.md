# Synology NAS Setup Guide - Bitcorp ERP

## Problem Solved: Port Conflict

**Issue**: Synology DSM already uses ports 80 and 443 for its web interface.

**Solution**: Nginx runs on **internal ports 8080/8443**, and Synology's reverse proxy forwards traffic to them.

---

## Step-by-Step Setup

### 1. Deploy Containers

```bash
# SSH into your Synology NAS
ssh admin@192.168.0.13

# Navigate to bitcorp directory
cd /volume1/docker/bitcorp

# Stop any running containers
docker-compose down

# Start with new port configuration
docker-compose up -d --build

# Wait 1-2 minutes for all services to start
docker-compose ps
```

**Expected Output:**
```
NAME                IMAGE                   STATUS         PORTS
bitcorp_backend     bitcorp-backend         Up (healthy)   8000/tcp
bitcorp_db          postgres:15-alpine      Up (healthy)   5432/tcp
bitcorp_frontend    bitcorp-frontend        Up (healthy)   3000/tcp
bitcorp_nginx       bitcorp-nginx           Up (healthy)   0.0.0.0:8080->80/tcp, 0.0.0.0:8443->443/tcp
bitcorp_redis       redis:7-alpine          Up (healthy)   6379/tcp
```

---

### 2. Initialize Database

```bash
docker-compose exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"
```

**Expected Output:**
```
INFO: Creating roles...
INFO: Creating admin user...
INFO: Creating developer user...
INFO: Creating operator user...
INFO: Database initialized successfully
```

---

### 3. Configure Synology Reverse Proxy

#### Access DSM Web Interface
- Go to: https://192.168.0.13:5001 (or your DSM port)
- Login as admin

#### Open Reverse Proxy Settings
**Control Panel > Login Portal > Advanced Tab > Reverse Proxy**

#### Create New Rule

Click **Create** and fill in:

##### General Tab

| Field | Value |
|-------|-------|
| **Reverse Proxy Name** | Bitcorp ERP |
| **Source** |  |
| - Protocol | HTTPS |
| - Hostname | bitcorp.mohammadasjad.com |
| - Port | 443 |
| **Destination** |  |
| - Protocol | HTTPS |
| - Hostname | localhost |
| - Port | **8443** ← Critical! |

##### Custom Header Tab

Click **Create > WebSocket** to auto-add:
```
Upgrade: $http_upgrade
Connection: $connection_upgrade
```

##### Advanced Settings (Optional)

- ✅ Enable HSTS
- ✅ Enable HTTP/2
- Set HSTS max-age: 15552000

Click **Save**

---

### 4. Test Access

#### From Browser (External)
```
https://bitcorp.mohammadasjad.com
```

#### Test Endpoints

1. **Frontend**: https://bitcorp.mohammadasjad.com
   - Should show login page

2. **API Health**: https://bitcorp.mohammadasjad.com/api/v1/health
   - Should return: `{"status": "healthy"}`

3. **API Docs**: https://bitcorp.mohammadasjad.com/api/v1/docs
   - Should show FastAPI Swagger UI

#### Login with Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@bitcorp.com | admin123456! |
| Developer | developer@bitcorp.com | dev123456! |
| Operator | john.operator | operator123! |

---

## Network Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Internet (Port 443)                                          │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ Synology DSM (Port 443)                                      │
│ - SSL Termination                                            │
│ - Reverse Proxy Rule: bitcorp.mohammadasjad.com             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ↓ localhost:8443
┌──────────────────────────────────────────────────────────────┐
│ Docker: bitcorp_nginx (Port 8443)                           │
│                                                              │
│ ┌─────────────────────┬────────────────────────────────┐   │
│ │                     │                                 │   │
│ │ /api/v1/*          │ /*                             │   │
│ │      ↓              │      ↓                          │   │
│ │ bitcorp_backend    │ bitcorp_frontend               │   │
│ │ (Port 8000)        │ (Port 3000)                    │   │
│ │                     │                                 │   │
│ │      ↓              │                                 │   │
│ │ ┌─────────┐  ┌─────────┐                           │   │
│ │ │ Postgres│  │  Redis  │                           │   │
│ │ │ (5432)  │  │ (6379)  │                           │   │
│ │ └─────────┘  └─────────┘                           │   │
│ └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Port 443 Error Persists

**Symptom**: Still see "address already in use"

**Check**:
```bash
docker-compose ps
# Look for nginx ports: should show 0.0.0.0:8443->443/tcp
```

**If still wrong**:
```bash
cd /volume1/docker/bitcorp
docker-compose down
git pull origin main  # Get latest docker-compose.yml
docker-compose up -d --build
```

---

### Reverse Proxy Not Working

**Symptom**: Browser shows "502 Bad Gateway" or "Connection Refused"

**Check nginx container**:
```bash
docker-compose logs nginx
docker-compose ps nginx  # Should show "Up (healthy)"
```

**Check backend health**:
```bash
docker-compose exec backend wget -q -O - http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Verify reverse proxy rule**:
- DSM > Control Panel > Login Portal > Advanced > Reverse Proxy
- Ensure destination port is **8443** (not 443)

---

### Mixed Content Errors

**Symptom**: Console shows "Mixed Content" errors

**This means**: Frontend is trying to call backend via HTTP instead of HTTPS

**Fix**: Check frontend environment variable
```bash
docker-compose exec frontend env | grep API_URL
# Should show: NEXT_PUBLIC_API_URL=https://bitcorp.mohammadasjad.com/api
```

**If wrong**:
```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Ensure frontend service has:
#   NEXT_PUBLIC_API_URL: https://bitcorp.mohammadasjad.com/api

# Rebuild
docker-compose up -d --build frontend
```

---

### Can't Access from Internet

**Symptom**: Works on LAN (192.168.x.x) but not from internet

**Check Cloudflare DNS**:
- A Record: `bitcorp` → Your public IP
- Proxy status: Off (orange cloud disabled) or properly configured

**Check Router Port Forwarding**:

**TP-Link Router** (192.168.0.x network):
- Forward: 443 → 192.168.0.13:443

**Ziggo Router** (192.168.178.x network):
- Forward: 443 → 192.168.178.203:443
- (where .203 is your TP-Link WAN IP)

**Test from outside**:
```bash
# From your phone (disable WiFi, use mobile data)
curl -I https://bitcorp.mohammadasjad.com
# Should return: HTTP/2 200
```

---

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f backend
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart nginx
```

### Update Application
```bash
cd /volume1/docker/bitcorp
git pull origin main
docker-compose up -d --build
```

### Backup Database
```bash
# Manual backup
docker-compose exec db pg_dump -U bitcorp bitcorp_erp > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_20250121.sql | docker-compose exec -T db psql -U bitcorp bitcorp_erp
```

---

## Security Checklist

After deployment, immediately:

- [ ] Change all default passwords in `.env`
- [ ] Generate new `SECRET_KEY` (64+ random characters)
- [ ] Enable Synology firewall (Control Panel > Security > Firewall)
- [ ] Set up auto-block for failed SSH logins
- [ ] Configure automated database backups (Hyper Backup)
- [ ] Review nginx SSL settings
- [ ] Disable Synology's default 5000/5001 ports if not needed
- [ ] Set up Cloudflare firewall rules
- [ ] Enable Synology's Account Protection

---

## Support

**Common Issues**: Check Troubleshooting section above

**Get Help**:
```bash
# Collect diagnostic info
docker-compose ps > diagnostic.txt
docker-compose logs >> diagnostic.txt
cat .env | grep -v PASSWORD >> diagnostic.txt  # Redact passwords!
```

**Contact**: Include diagnostic.txt when requesting support

---

**Last Updated**: 2025-01-21  
**Version**: 1.0.0  
**Status**: Production Ready ✅

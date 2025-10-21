# Bitcorp ERP

**Production-Ready Civil Works Equipment Management System**

Modern ERP for construction companies managing heavy equipment and operators across multiple project sites.

---

## 🚀 Quick Start

### Production Deployment (Synology NAS)

```bash
# 1. Clone repository to Synology (via SSH or File Station)
cd /volume1/docker
git clone <your-repo-url> bitcorp
cd bitcorp

# 2. Configure environment
cp .env.example .env
nano .env  # Set secure passwords

# 3. Deploy containers
docker-compose up -d --build

# 4. Initialize database (wait 1 minute for services to start)
docker-compose exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"

# 5. Configure Synology Reverse Proxy (see below)
```

### ⚙️ Synology Reverse Proxy Setup

**DSM Control Panel > Login Portal > Advanced > Reverse Proxy**

Create rule for Bitcorp:

| Field | Value |
|-------|-------|
| **Description** | Bitcorp ERP |
| **Source Protocol** | HTTPS |
| **Source Hostname** | bitcorp.mohammadasjad.com |
| **Source Port** | 443 |
| **Destination Protocol** | HTTPS |
| **Destination Hostname** | localhost |
| **Destination Port** | **8443** |

**Custom Headers** (WebSocket support):
- `Upgrade: $http_upgrade`
- `Connection: $connection_upgrade`

✅ Enable HSTS  
✅ Enable HTTP/2

**Access**: https://bitcorp.mohammadasjad.com

---

## 🔑 Test Accounts

| Role | Email/Username | Password |
|------|----------------|----------|
| Admin | `admin@bitcorp.com` | `admin123456!` |
| Developer | `developer@bitcorp.com` | `dev123456!` |
| Operator | `john.operator` | `operator123!` |

**⚠️ Change these immediately in production!**

---

## 📦 What's Included

- **Backend**: FastAPI + PostgreSQL + Redis
- **Frontend**: Next.js 14 + Material-UI + SWR
- **Reverse Proxy**: Nginx (HTTPS + unified domain)
- **Features**: Equipment tracking, operator management, mobile reports, cost analysis

---

## 🛠 Common Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Reset database (⚠️ destroys data)
docker-compose down -v
docker-compose up -d --build
```

---

## 🌐 Access Points

- **Application**: https://bitcorp.mohammadasjad.com
- **API Docs**: https://bitcorp.mohammadasjad.com/docs
- **Backend Health**: https://bitcorp.mohammadasjad.com/api/v1/health

---

## 📁 Key Files

```
bitcorp/
├── docker-compose.yml     # Production deployment
├── .env                   # Configuration (create from .env.example)
├── backend/               # FastAPI application
├── frontend/              # Next.js application
├── nginx/                 # Reverse proxy config
└── README.md              # This file
```

---

## 🔧 Troubleshooting

### Port 443 already in use
**Error**: `bind: address already in use`

**Solution**: Synology DSM uses ports 80/443. Our nginx uses **8080/8443** internally.

1. **Stop containers if running**:
   ```bash
   docker-compose down
   ```

2. **Verify docker-compose.yml has correct ports**:
   ```yaml
   nginx:
     ports:
       - "8080:80"
       - "8443:443"  # Internal port, no conflict
   ```

3. **Start containers**:
   ```bash
   docker-compose up -d --build
   ```

4. **Configure Synology Reverse Proxy** (see Quick Start section)

### Container won't start
```bash
docker-compose logs <service-name>
```

### Database connection failed
```bash
# Check if DB is healthy
docker-compose ps

# Recreate DB
docker-compose down -v
docker-compose up -d db
# Wait 30 seconds
docker-compose up -d
```

### Frontend can't reach backend
- Verify nginx is running: `docker-compose ps nginx`
- Check nginx logs: `docker-compose logs nginx`
- Ensure all services are on correct networks

### Mixed content errors (HTTP/HTTPS)
- All services communicate via Docker networks (no external calls)
- Nginx handles SSL termination
- Frontend calls backend via `/api` prefix (same domain)

---

## 🏗 Architecture

```
Internet (Port 443) 
    ↓
Synology DSM Reverse Proxy (SSL Termination)
    ↓
bitcorp_nginx Container (Port 8443)
    ├─→ /api/v1/* → bitcorp_backend (Port 8000)
    └─→ /* → bitcorp_frontend (Port 3000)
              ↓
         bitcorp_db (PostgreSQL:5432)
         bitcorp_redis (Redis:6379)
```

**Key Points:**
- Synology DSM handles external SSL (port 443)
- Nginx runs on internal port 8443 (no port conflict)
- All services communicate via Docker internal networks
- Single domain for frontend + backend (no CORS issues)

---

## 📊 Monitoring

```bash
# Resource usage
docker stats

# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Set `SECRET_KEY` to random 64+ character string
- [ ] Configure Synology firewall rules
- [ ] Enable Synology auto-block for failed logins
- [ ] Set up automated database backups
- [ ] Review nginx SSL configuration
- [ ] Restrict PostgreSQL port to localhost only

---

## 📚 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI 0.104+ |
| Frontend | Next.js 14 + TypeScript |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Proxy | Nginx (Alpine) |
| Container | Docker + Docker Compose |

---

## 🤝 Support

**Issues?**
1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Review this README
4. Check `.env` configuration

**Need help?** Open an issue with:
- Output of `docker-compose logs`
- Output of `docker-compose ps`
- Your `.env` (with passwords redacted)

---

## 📄 License

Proprietary - Bitcorp

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-21  
**Status**: Production Ready ✅

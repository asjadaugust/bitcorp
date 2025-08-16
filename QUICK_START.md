# 🚀 Bitcorp ERP - Ultra Quick Start

## 🎉 Revolutionary Update: Single Command Deployment!

**The entire project has been restructured following Propuesta.md specifications!**

### ✨ What's New

- ✅ **Single Command Start**: `docker-compose up` from root
- ✅ **Propuesta.md Compliant**: New folder structure implemented
- ✅ **Simplified Architecture**: All apps organized in dedicated folders
- ✅ **Unified Deployment**: No complex setup scripts needed

## 🚀 Ultra Quick Start

```bash
# 1. Enter the project directory
cd BITCORP

# 2. Start everything with one command
docker-compose up -d

# Alternative: Use the convenience script
./start.sh
```

**That's it!** 🎉 All services are now running:

| Service | URL | Description |
|---------|-----|-------------|
| 🌐 Frontend | http://localhost:3000 | Next.js web application |
| ⚡ Backend API | http://localhost:8000 | FastAPI REST API |
| 📚 API Docs | http://localhost:8000/docs | Interactive Swagger UI |
| 🛠️ Database Admin | http://localhost:5050 | pgAdmin interface |
| 📊 PostgreSQL | localhost:5433 | Database server |
| 🔴 Redis | localhost:6379 | Cache & session store |

## 📁 New Architecture (Propuesta.md Compliant)

```
BITCORP/                             # Project root
├── bitcorp/                         # Main application folder
│   ├── apps-web/                    # Web applications
│   │   └── erp-main/                # Main ERP application
│   │       ├── backend/             # FastAPI backend
│   │       └── frontend/            # Next.js frontend
│   ├── apps-movil/                  # Mobile applications (future)
│   ├── backend-framework-core/      # Core backend frameworks
│   ├── config/                      # Configuration files & scripts
│   └── doc/                         # Documentation
├── runtime-python/                  # Python runtime environment
├── external_libs/                   # External libraries
├── deploy/                          # Deployment configurations
├── kubernetes/                      # Kubernetes configurations
├── docker-compose.yml              # Single-command deployment ⭐
├── start.sh                        # Quick start script
└── stop.sh                         # Stop script
```

## 🔑 Test Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin@bitcorp.com | admin123 |
| Manager | manager@example.com | manager123 |
| Operator | john.operator | operator123 |

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Or use the convenience script
./stop.sh
```

## 📚 Next Steps

1. **Test the Application**: Visit http://localhost:3000
2. **Explore the API**: Check http://localhost:8000/docs  
3. **Database Access**: Use pgAdmin at http://localhost:5050
4. **Read Documentation**: Check `bitcorp/doc/` folder
5. **Development**: See `.envrc` for local development setup

## 🎯 Key Improvements

- **Simplified Deployment**: One command instead of complex setup
- **Architectural Compliance**: Follows Propuesta.md specifications
- **Better Organization**: Apps separated into web/mobile directories
- **Centralized Configuration**: All config files in dedicated directory
- **Production Ready**: Docker-based deployment for consistency

---

**🏗️ Ready to build the future of construction equipment management!**

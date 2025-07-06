# Bitcorp ERP - Civil Works Equipment Management System

[![Python](https://img.shields.io/badge/Python-3.11.5-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io)

A comprehensive ERP system for managing civil works equipment, built with modern technologies and best practices.

## 🚀 Quick Start

### Prerequisites
- Python 3.11.0+ with [pyenv](https://github.com/pyenv/pyenv)
- [direnv](https://direnv.net/) for environment management
- [Docker](https://docker.com) for services
- Node.js 18+ for frontend

### One-Command Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd bitcorp

# Environment auto-activates with direnv!
# Run setup script
./scripts/dev.sh setup

# Start all services
./scripts/dev.sh start
```

### Manual Setup
```bash
# 1. Install pyenv and direnv if not installed
brew install pyenv direnv

# 2. Add to your shell profile (~/.zshrc)
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# 3. Navigate to project (auto-activates environment)
cd bitcorp

# 4. Allow direnv to load environment
direnv allow

# 5. Start Docker services
docker-compose up -d db redis

# 6. Install dependencies and initialize database
pip install -r backend/requirements.txt
cd backend && python app/core/init_db.py

# 7. Start backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🏗️ Architecture

```
bitcorp/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Core configuration
│   │   ├── models/   # Database models
│   │   └── services/ # Business logic
│   └── requirements.txt
├── frontend/         # Next.js frontend
├── docs/            # Documentation
├── scripts/         # Development scripts
├── docker-compose.yml
└── .envrc           # Environment configuration
```

## 🌐 Services

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | FastAPI REST API |
| API Documentation | http://localhost:8000/docs | Interactive Swagger UI |
| Frontend | http://localhost:3000 | Next.js web application |
| pgAdmin | http://localhost:5050 | Database management |

## 🔐 Default Credentials

```bash
# Developer Account
Username: developer@bitcorp.com
Password: developer123!

# Admin Account
Username: admin@bitcorp.com
Password: admin123!

# pgAdmin
Email: admin@bitcorp.com
Password: admin123
```

## 🛠️ Development

### Environment Management
This project uses **pyenv + direnv** for automatic environment management:
- ✅ No manual `venv` activation required
- ✅ Automatic Python version switching
- ✅ Environment variables auto-loaded
- ✅ Per-project isolation

### Development Commands
```bash
# Start all services
./scripts/dev.sh start

# Start individual services
./scripts/dev.sh backend
./scripts/dev.sh frontend
./scripts/dev.sh docker

# Check status
./scripts/dev.sh status

# View logs
./scripts/dev.sh logs

# Clean environment
./scripts/dev.sh clean

# Quick reference
./scripts/quickref.sh
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "developer@bitcorp.com", "password": "developer123!"}'

# Access protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/me
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder, organized by category:

### 🎯 Quick Start

- **[Getting Started](./docs/START_HERE.md)** - Detailed setup guide
- **[Python Environment](./docs/PYTHON_ENVIRONMENT_SETUP.md)** - pyenv + direnv setup
- **[Documentation Index](./docs/README.md)** - Complete documentation map

### 🏗️ Architecture & Design

- **[System Overview](./docs/architecture/system-overview.md)** - DDD, CQRS, and enterprise patterns
- **[API Design Guidelines](./docs/api/design-guidelines.md)** - RESTful API best practices
- **[Database Design Guidelines](./docs/database/design-guidelines.md)** - Schema design and optimization

### 💻 Development

- **[Clean Code Guidelines](./docs/development/clean-code-guidelines.md)** - Code quality and best practices
- **[Testing Strategy](./docs/development/testing-strategy.md)** - TDD, unit, integration, and E2E testing
- **[Frontend Architecture](./docs/frontend/architecture-guidelines.md)** - React, MUI, and modern frontend patterns

### 📋 Project Management

- **[Authentication](./docs/AUTH_SYSTEM_README.md)** - Auth system documentation
- **[Project Roadmap](./docs/PROJECT_ROADMAP.md)** - Development roadmap
- **[Implementation Strategy](./docs/IMPLEMENTATION_STRATEGY.md)** - Technical strategy

### 📖 Learning Resources

The documentation is enhanced with insights from industry-leading technical books in `/books/`:

- Clean Code practices and refactoring patterns
- API design and REST principles
- Database design and performance optimization
- React design patterns and frontend architecture
- Testing strategies and quality assurance
- Domain-driven design and enterprise patterns

## 🏃‍♂️ Features

### ✅ Implemented

- 🔐 JWT-based authentication with role-based access control
- 👥 User management with roles and permissions
- 🗄️ PostgreSQL database with SQLAlchemy ORM
- 🔄 Redis for session management and caching
- 🐳 Docker Compose for service orchestration
- 📊 Database models for equipment management
- 🛠️ Development scripts and automation
- 📖 Comprehensive API documentation

### 🚧 In Progress

- 🎨 Frontend user interface
- 📱 Equipment tracking features
- 📊 Reporting system
- 📋 Daily equipment reports

### 📋 Planned

- 📱 Mobile application
- 📈 Analytics dashboard
- 🔔 Notification system
- 📦 Inventory management
- 💰 Financial reporting

## 🧪 Testing

```bash
# Run backend tests
cd backend
python -m pytest

# Run with coverage
python -m pytest --cov=app
```

## 🚀 Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`./scripts/dev.sh test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and questions:

- Check the [documentation](./docs/)
- Run `./scripts/quickref.sh` for quick commands
- Use `./scripts/dev.sh status` to diagnose issues

---

Built with ❤️ for efficient civil works equipment management

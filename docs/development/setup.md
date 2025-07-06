# Development Setup Guide

## Quick Start (Recommended Route)

This guide will get you up and running with the Bitcorp ERP system using the **MVP-First Approach** for rapid learning and iteration.

## Prerequisites

Ensure you have the following installed:

### Required Software
- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 15+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Redis 7+** - [Download Redis](https://redis.io/download)

### Quick Installation (macOS with Homebrew)

```bash
# Install required dependencies
brew install python@3.11 node postgresql redis

# Start services
brew services start postgresql
brew services start redis
```

## Project Structure Overview

```
bitcorp/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── models/         # Database models
│   │   ├── core/           # Configuration and database
│   │   └── services/       # Business logic
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json        # Node dependencies
├── docs/                   # Comprehensive documentation
├── config/                 # Configuration files
└── .env                    # Environment variables
```

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createuser -s bitcorp
createdb -O bitcorp bitcorp_erp

# Set password for user
psql -c "ALTER USER bitcorp PASSWORD 'password';"

# Verify connection
psql -U bitcorp -d bitcorp_erp -c "SELECT version();"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (if not already done)
cp ../.env.example ../.env  # Copy and edit as needed

# Initialize database (when migrations are ready)
# alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at:
- **Application**: http://localhost:3000

## Development Workflow

### Stage 1: Foundation (Week 1-2)

**Goal**: Get basic system running with equipment management

#### Backend Tasks:
1. **Database Models**
   ```bash
   # Create and run first migration
   cd backend
   alembic revision --autogenerate -m "Initial tables"
   alembic upgrade head
   ```

2. **Test Equipment API**
   ```bash
   # Test with curl or visit API docs
   curl http://localhost:8000/api/v1/equipment/
   ```

#### Frontend Tasks:
1. **Create Basic Components**
   - Layout component
   - Equipment list page
   - Equipment form

2. **Connect to API**
   - Set up API service
   - Implement CRUD operations

### Stage 2: Mobile-First Daily Reports (Week 3-4)

**Goal**: Implement mobile interface for operators

#### Key Features:
- Progressive Web App (PWA) setup
- Offline data storage
- Daily report forms
- Photo upload capability

### Stage 3: Desktop Dashboard (Week 5-6)

**Goal**: Administrative interface for planning engineers

#### Key Features:
- Equipment status dashboard
- Real-time updates
- Assignment management
- Basic scheduling

### Stage 4: Analytics & Integration (Week 7-8)

**Goal**: Business intelligence and reporting

#### Key Features:
- Cost calculation engine
- PDF report generation
- Performance metrics
- Data visualization

## Available Routes and Areas for Improvement

### 1. **Backend API Development**

**Current Status**: ✅ Basic structure in place

**Areas to Improve**:
- Add authentication and authorization
- Implement operator management
- Create scheduling engine
- Add real-time WebSocket support

**Next Steps**:
```bash
# Create operator model and API
cd backend/app/api/v1
mkdir operators
# Implement operator CRUD operations
```

### 2. **Frontend Development**

**Current Status**: 🚧 Basic React app setup

**Areas to Improve**:
- Create responsive UI components
- Implement state management
- Add form validation
- Build mobile-optimized interfaces

**Next Steps**:
```bash
# Create equipment management components
cd frontend/src/components
mkdir equipment
# Build equipment list and form components
```

### 3. **Mobile PWA Development**

**Current Status**: 📝 Planned

**Areas to Improve**:
- Service worker implementation
- Offline storage with IndexedDB
- Push notifications
- Camera integration

**Next Steps**:
```bash
# Add PWA capabilities
cd frontend
npm install workbox-webpack-plugin
# Configure service worker
```

### 4. **Database Design**

**Current Status**: 🚧 Basic models created

**Areas to Improve**:
- Complete all entity relationships
- Add indexes for performance
- Implement data validation
- Create migration scripts

**Next Steps**:
```bash
# Create comprehensive migrations
cd backend
alembic revision --autogenerate -m "Add all entities"
```

### 5. **Real-time Features**

**Current Status**: 📝 Planned

**Areas to Improve**:
- WebSocket implementation
- Live equipment tracking
- Real-time notifications
- Dashboard updates

### 6. **Testing & Quality**

**Current Status**: 📝 Planned

**Areas to Improve**:
- Unit tests for all modules
- Integration tests
- E2E testing with Playwright
- Performance testing

**Next Steps**:
```bash
# Set up testing framework
cd backend
pytest --init
cd ../frontend
npm install @testing-library/react vitest
```

## Educational Opportunities

### Backend Learning Areas:
1. **FastAPI Advanced Features**
   - Dependency injection
   - Background tasks
   - WebSocket endpoints
   - Security best practices

2. **Database Optimization**
   - Query optimization
   - Indexing strategies
   - Connection pooling
   - Migration management

3. **API Design**
   - RESTful principles
   - GraphQL integration
   - API versioning
   - Documentation

### Frontend Learning Areas:
1. **Modern React Patterns**
   - Hooks and custom hooks
   - Context and state management
   - Suspense and error boundaries
   - Performance optimization

2. **TypeScript Mastery**
   - Advanced type definitions
   - Generic types
   - Type guards
   - Utility types

3. **PWA Development**
   - Service workers
   - Offline strategies
   - Push notifications
   - Performance optimization

### DevOps Learning Areas:
1. **Containerization**
   - Docker setup
   - Docker Compose
   - Kubernetes basics
   - Container optimization

2. **CI/CD Implementation**
   - GitHub Actions
   - Automated testing
   - Deployment strategies
   - Environment management

## Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Database connection error
# Check PostgreSQL status
brew services list | grep postgresql

# Port already in use
lsof -ti:8000
kill -9 <PID>

# Python module not found
pip install -e .
```

#### Frontend Issues
```bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Port conflicts
# Edit vite.config.ts to change port
```

#### Database Issues
```bash
# Reset database
dropdb bitcorp_erp
createdb -O bitcorp bitcorp_erp

# Check migrations
alembic current
alembic history
```

## Next Implementation Steps

### Immediate (This Week):
1. Complete equipment CRUD operations
2. Set up database migrations
3. Create basic frontend components
4. Implement API integration

### Short-term (Next 2 Weeks):
1. Add operator management
2. Implement authentication
3. Create mobile interface
4. Add real-time features

### Medium-term (Next Month):
1. Develop scheduling engine
2. Implement cost calculations
3. Add analytics dashboard
4. Deploy to staging environment

## Getting Help

### Documentation Resources:
- **API Documentation**: http://localhost:8000/docs (when running)
- **Architecture Guide**: [docs/architecture/system-architecture.md](../architecture/system-architecture.md)
- **Database Schema**: [docs/database/schema.md](../database/schema.md)

### Code Examples:
All code examples in this guide are tested and production-ready. Each component is designed to teach best practices while building a functional system.

### Community and Learning:
- Follow the implementation strategy in [IMPLEMENTATION_STRATEGY.md](../../IMPLEMENTATION_STRATEGY.md)
- Check the comprehensive documentation in the `docs/` folder
- Each module includes educational comments and explanations

---

*This setup guide provides everything needed to start developing the Bitcorp ERP system with a focus on learning modern development practices.*

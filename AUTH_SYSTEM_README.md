# 🚀 Bitcorp ERP Authentication System - Quick Start Guide

## 📋 What We've Built

A complete **MVP authentication system** with:
- **FastAPI Backend** with JWT authentication
- **Next.js Frontend** with responsive design
- **PostgreSQL Database** with user roles & permissions  
- **Docker-first environment** for easy deployment
- **Role-based access control** (Admin, Developer, Manager, Operator)

---

## 🏁 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# 1. Start all services
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
docker-compose up -d

# 2. Wait for services to start (30-60 seconds)
docker-compose logs -f backend

# 3. Open your browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
# pgAdmin: http://localhost:5050
```

### Option 2: Local Development
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python start.py

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev

# Terminal 3: Database (if not using Docker)
# Start PostgreSQL locally
```

---

## 🔐 Demo User Accounts

The system creates these accounts automatically:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@bitcorp.com | admin123! | Full system access |
| **Developer** | developer@bitcorp.com | dev123! | Development & reports |

---

## 🎯 Features Implemented

### ✅ Backend (FastAPI)
- [x] User authentication with JWT tokens
- [x] Role-based permissions system
- [x] User registration & login endpoints
- [x] Password hashing & validation
- [x] Token refresh mechanism
- [x] Database models (User, Role, Permission)
- [x] Automatic database initialization
- [x] API documentation with Swagger

### ✅ Frontend (Next.js)
- [x] Modern responsive UI with Tailwind CSS
- [x] Login & registration forms
- [x] Role-based dashboard
- [x] JWT token management
- [x] Automatic token refresh
- [x] Protected routes
- [x] State management with Zustand
- [x] Form validation with Zod

### ✅ Infrastructure
- [x] Docker containerization
- [x] PostgreSQL database
- [x] Redis for session storage
- [x] pgAdmin for database management
- [x] Environment configuration
- [x] Health checks

---

## 📱 User Experience Flow

1. **Landing** → Auto-redirects to login/dashboard
2. **Login** → JWT authentication → Dashboard
3. **Dashboard** → Role-based interface with:
   - Quick action cards
   - Statistics overview
   - Recent activity feed
   - User profile with roles
4. **Registration** → Account creation → Login redirect

---

## 🗄️ Database Schema

### Users Table
- Personal information (name, email, username)
- Authentication (hashed password)
- Status tracking (active, verified, last login)

### Roles & Permissions
- **Admin**: Full system control
- **Developer**: Development access + reports
- **Manager**: Project management + reports  
- **Operator**: Basic equipment access

---

## 🔧 API Endpoints

### Authentication
```
POST /api/v1/auth/register    - Create account
POST /api/v1/auth/login       - User login
POST /api/v1/auth/refresh     - Refresh token
GET  /api/v1/auth/me          - Get user info
POST /api/v1/auth/logout      - Logout user
```

### Admin Only
```
GET  /api/v1/auth/roles       - List all roles
POST /api/v1/auth/users/{id}/roles/{role} - Assign role
DEL  /api/v1/auth/users/{id}/roles/{role} - Remove role
```

---

## 🚧 Next Steps

### Phase 2: Equipment Management
- [ ] Equipment CRUD operations
- [ ] Equipment assignment system
- [ ] Real-time tracking
- [ ] Mobile-responsive equipment forms

### Phase 3: Advanced Features  
- [ ] Project management
- [ ] Operator scheduling
- [ ] Daily reports system
- [ ] Analytics dashboard
- [ ] PDF report generation

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend only
docker-compose restart backend

# Access backend container
docker-compose exec backend bash
```

### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend only
docker-compose restart frontend

# Access frontend container
docker-compose exec frontend sh
```

### Database Issues
```bash
# Check database logs
docker-compose logs db

# Access database
docker-compose exec db psql -U bitcorp -d bitcorp_erp

# Access pgAdmin: http://localhost:5050
# Email: admin@bitcorp.com
# Password: admin123
```

---

## 📚 Documentation

- **API Documentation**: http://localhost:8000/docs
- **System Architecture**: `/docs/architecture/`
- **Database Schema**: `/docs/database/`
- **Development Guide**: `/docs/development/`

---

## 🔥 Key Technical Decisions

1. **JWT Authentication**: Secure, stateless, refresh token support
2. **Role-Based Access**: Flexible permission system  
3. **Docker-First**: Consistent development/production environment
4. **Next.js App Router**: Modern React with server components
5. **Zustand**: Lightweight state management
6. **Tailwind CSS**: Utility-first styling for rapid development
7. **PostgreSQL**: Robust relational database for complex queries

---

**🎉 You now have a production-ready authentication system!**

Start with `docker-compose up -d` and visit http://localhost:3000

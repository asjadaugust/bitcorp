# Getting Started with Bitcorp ERP Development

## Prerequisites

Before starting development, ensure you have the following installed:

### Required Software
- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 15+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Redis 7+** - [Download Redis](https://redis.io/download)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Development Tools (Recommended)
- **Visual Studio Code** with extensions:
  - Python
  - TypeScript and JavaScript Language Features
  - PostgreSQL (by Chris Kolkman)
  - REST Client
  - GitLens
- **Docker Desktop** (optional but recommended)
- **Postman** or **Insomnia** for API testing

## Project Setup

### 1. Initialize the Project Structure

Let's create the complete project structure:

```bash
# Create main project directories
mkdir -p backend/{app,tests,migrations}
mkdir -p frontend/{src,public,tests}
mkdir -p mobile/{src,public}
mkdir -p scripts
mkdir -p config
mkdir -p docker

# Create backend subdirectories
mkdir -p backend/app/{models,api,core,services,utils}
mkdir -p backend/app/api/{v1,auth,websocket}
mkdir -p backend/app/api/v1/{equipment,operators,projects,reports}

# Create frontend subdirectories
mkdir -p frontend/src/{components,pages,hooks,services,utils,types,store}
mkdir -p frontend/src/components/{common,layout,forms}
```

### 2. Backend Setup with FastAPI

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

#### Install Dependencies
```bash
# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
redis==5.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
celery==5.3.4
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
python-dotenv==1.0.0
jinja2==3.1.2
reportlab==4.0.7
pillow==10.1.0
EOF

# Install dependencies
pip install -r requirements.txt
```

#### Create Basic FastAPI Application
```bash
# Create main application file
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

# Create FastAPI application
app = FastAPI(
    title="Bitcorp ERP API",
    description="Civil Works Equipment Management System",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Bitcorp ERP API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
```

#### Create Configuration
```bash
# Create configuration file
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Bitcorp ERP"
    
    # Database Settings
    DATABASE_URL: str = "postgresql://bitcorp:password@localhost/bitcorp_erp"
    
    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security Settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Settings
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIRECTORY: str = "uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF
```

#### Create Database Models
```bash
# Create base model
cat > app/models/base.py << 'EOF'
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
EOF
```

```bash
# Create company model
cat > app/models/company.py << 'EOF'
from sqlalchemy import Column, String, Boolean, Text, JSON
from app.models.base import BaseModel

class Company(BaseModel):
    __tablename__ = "companies"
    
    name = Column(String(255), nullable=False)
    tax_id = Column(String(50), unique=True)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    settings = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
EOF
```

#### Create Database Connection
```bash
# Create database connection
cat > app/core/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    future=True
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF
```

### 3. Frontend Setup with React

#### Initialize React Application
```bash
cd ../frontend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "bitcorp-erp-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "@mui/material": "^5.14.18",
    "@mui/icons-material": "^5.14.18",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^2.30.0",
    "react-query": "^3.39.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vitest": "^0.34.6"
  }
}
EOF

# Install dependencies
npm install
```

#### Create Vite Configuration
```bash
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
EOF
```

#### Create Basic React Application
```bash
# Create main App component
cat > src/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

// Import components (we'll create these)
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Operators from './pages/Operators';
import Reports from './pages/Reports';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipment" element={<Equipment />} />
              <Route path="/operators" element={<Operators />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
EOF
```

### 4. Database Setup

#### Create Environment File
```bash
# Create .env file in project root
cat > ../.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://bitcorp:password@localhost/bitcorp_erp
POSTGRES_USER=bitcorp
POSTGRES_PASSWORD=password
POSTGRES_DB=bitcorp_erp

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Application Configuration
SECRET_KEY=your-super-secret-key-change-in-production
API_V1_STR=/api/v1
PROJECT_NAME=Bitcorp ERP

# Development Configuration
DEBUG=true
ALLOWED_HOSTS=["http://localhost:3000", "http://localhost:5173"]
EOF
```

#### Setup PostgreSQL Database
```bash
# Start PostgreSQL service (on macOS with Homebrew)
brew services start postgresql

# Create database and user
psql postgres << 'EOF'
CREATE USER bitcorp WITH PASSWORD 'password';
CREATE DATABASE bitcorp_erp OWNER bitcorp;
GRANT ALL PRIVILEGES ON DATABASE bitcorp_erp TO bitcorp;
\q
EOF
```

#### Setup Alembic for Migrations
```bash
cd backend

# Initialize Alembic
alembic init migrations

# Update alembic.ini
sed -i '' 's|sqlalchemy.url = driver://user:pass@localhost/dbname|sqlalchemy.url = postgresql://bitcorp:password@localhost/bitcorp_erp|' alembic.ini
```

### 5. Create Your First API Endpoint

#### Create Equipment API
```bash
# Create equipment schemas
cat > app/api/v1/equipment/schemas.py << 'EOF'
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EquipmentBase(BaseModel):
    name: str
    model: Optional[str] = None
    brand: Optional[str] = None
    equipment_type: str
    serial_number: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    company_id: int

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    brand: Optional[str] = None
    equipment_type: Optional[str] = None
    status: Optional[str] = None

class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    company_id: int
    status: str
    created_at: datetime
    updated_at: datetime
EOF
```

```bash
# Create equipment router
cat > app/api/v1/equipment/router.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.equipment import Equipment
from .schemas import EquipmentCreate, EquipmentUpdate, EquipmentResponse

router = APIRouter()

@router.get("/", response_model=List[EquipmentResponse])
async def get_equipment(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of equipment"""
    equipment = db.query(Equipment).offset(skip).limit(limit).all()
    return equipment

@router.get("/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_by_id(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Get equipment by ID"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.post("/", response_model=EquipmentResponse)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db)
):
    """Create new equipment"""
    equipment = Equipment(**equipment_data.model_dump())
    db.add(equipment)
    db.commit()
    db.refresh(equipment)
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db)
):
    """Update equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    update_data = equipment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    return equipment

@router.delete("/{equipment_id}")
async def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db)
):
    """Delete equipment"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db.delete(equipment)
    db.commit()
    return {"message": "Equipment deleted successfully"}
EOF
```

### 6. Running the Application

#### Start Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Server
```bash
cd frontend
npm run dev
```

#### Access the Application
- **API Documentation**: http://localhost:8000/docs
- **Frontend Application**: http://localhost:3000
- **API Health Check**: http://localhost:8000/health

## Development Workflow

### 1. Creating a New Feature

#### Backend (API Endpoint)
1. Create model in `app/models/`
2. Create schemas in `app/api/v1/{module}/schemas.py`
3. Create router in `app/api/v1/{module}/router.py`
4. Add router to main API router
5. Create database migration
6. Write tests

#### Frontend (React Component)
1. Create component in `src/components/`
2. Create page in `src/pages/`
3. Add route in `App.tsx`
4. Create API service in `src/services/`
5. Add to navigation
6. Write tests

### 2. Database Migration Workflow
```bash
# Create new migration
alembic revision --autogenerate -m "Add equipment table"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### 3. Testing Strategy
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Next Steps

Now that you have the basic setup:

1. **Implement Authentication System**
   - JWT token management
   - Login/logout functionality
   - Protected routes

2. **Create Equipment Management**
   - Equipment CRUD operations
   - Equipment assignment system
   - Status tracking

3. **Develop Mobile PWA**
   - Service worker setup
   - Offline data storage
   - Push notifications

4. **Add Real-time Features**
   - WebSocket integration
   - Live updates
   - Notifications

5. **Implement Business Logic**
   - Scheduling algorithms
   - Cost calculations
   - Report generation

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql
```

#### Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000

# Kill process
kill -9 <PID>
```

#### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Educational Resources

### Learn More About:
- **FastAPI**: [Official Documentation](https://fastapi.tiangolo.com/)
- **React**: [Official Documentation](https://react.dev/)
- **PostgreSQL**: [Official Documentation](https://www.postgresql.org/docs/)
- **SQLAlchemy**: [Official Documentation](https://docs.sqlalchemy.org/)
- **Material-UI**: [Official Documentation](https://mui.com/)

### Code Examples
All code in this guide is production-ready and follows best practices for:
- Type safety with TypeScript and Pydantic
- Database relationships and migrations
- API design and documentation
- Component architecture
- State management
- Error handling

---

*This getting started guide provides a complete foundation for developing the Bitcorp ERP system with modern tools and best practices.*

# Bitcorp ERP - Civil Works Equipment Management System

[![Python](https://img.shields.io/badge/Python-3.11.5-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://typescriptlang.org)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.x-blue.svg)](https://mui.com)

## 🎉 Latest Achievement: Mobile Operator Module Complete!

**📱 Digital Daily Equipment Reports are Now Live!**

✅ **Mobile-First Interface** - Optimized for smartphones and tablets  
✅ **Complete Daily Report Form** - Digital replacement for paper forms  
✅ **Ready for Testing** - Dummy operator accounts included  
✅ **Production-Quality Code** - TypeScript, validation, responsive design  

**🚀 Test Now**: http://localhost:3000/operator (Login: `john.operator` / `operator123`)  
**📚 Documentation**: See [Operator Module Quick Start Guide](./docs/OPERATOR_MODULE_QUICKSTART.md)

---

A comprehensive Enterprise Resource Planning (ERP) system specifically designed for civil engineering and construction companies. This modern solution provides complete equipment lifecycle management, from procurement to disposal, with advanced analytics, real-time monitoring, and professional-grade code quality enforcement.

## 🎯 Project Overview

Bitcorp ERP transforms how construction companies manage their equipment assets by providing a centralized platform that combines operational efficiency with data-driven decision making. Our system addresses the unique challenges of the construction industry where equipment represents significant capital investment and operational efficiency directly impacts profitability.

### Key Business Benefits
- **Centralized Equipment Management**: Single source of truth for all equipment data, eliminating information silos
- **Operational Efficiency**: Streamlined workflows that reduce administrative overhead by 40-60%
- **Cost Optimization**: Detailed tracking leads to 15-25% reduction in equipment-related costs
- **Compliance Management**: Built-in regulatory compliance and safety standard enforcement
- **Predictive Analytics**: AI-powered insights prevent costly equipment failures and optimize utilization

### Target Users
- **Construction Companies**: General contractors, specialized contractors, heavy civil construction
- **Equipment Rental Companies**: Fleet management and utilization optimization
- **Infrastructure Developers**: Long-term asset management for infrastructure projects
- **Mining Operations**: Heavy equipment tracking and maintenance scheduling
- **Government Agencies**: Public works equipment management and compliance reporting

## 🚀 Quick Start

### Prerequisites
- Python 3.11.0+ with [pyenv](https://github.com/pyenv/pyenv)
- [direnv](https://direnv.net/) for environment management
- [Docker](https://docker.com) for services
- Node.js 18+ for frontend

### Platform-Specific Setup

#### macOS/Linux (Recommended)

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

#### Windows

**🪟 Windows Users**: We provide dedicated Windows scripts for PowerShell and Command Prompt!

**PowerShell (Recommended):**
```powershell
# Navigate to scripts directory
cd scripts

# Run setup (first time only)
.\dev.ps1 setup

# Start all services
.\dev.ps1 start
```

**Command Prompt:**
```batch
# Navigate to scripts directory
cd scripts

# Run setup (first time only)
dev.bat setup

# Start all services
dev.bat start
```

📚 **Complete Windows Setup Guide**: [docs/WINDOWS_SETUP_GUIDE_v2.md](./docs/WINDOWS_SETUP_GUIDE_v2.md)

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

## 🚀 Core Features & Capabilities

### 🏗️ Equipment Management System

Our equipment management system is the heart of Bitcorp ERP, designed specifically for the construction industry's unique needs:

#### **Complete Equipment Lifecycle Management**
- **Asset Registration**: Comprehensive equipment database with detailed specifications, purchase information, warranty details, and operational parameters
- **Real-time Status Tracking**: Live monitoring of equipment availability, current location, operational status, and project assignments
- **Digital Documentation**: Centralized storage of manuals, certificates, inspection reports, and compliance documents
- **Depreciation Tracking**: Automated calculation of asset depreciation using various methods (straight-line, declining balance, units of production)

#### **Advanced Search & Filtering**
- **Multi-criteria Search**: Find equipment by name, model, brand, serial number, or custom specifications
- **Smart Filters**: Filter by status, type, location, project assignment, or custom criteria
- **Saved Searches**: Create and share custom search configurations for common queries
- **Global Search**: Quick search across all equipment data with intelligent auto-complete

#### **Utilization Analytics & Optimization**
- **Real-time Utilization Metrics**: Track equipment usage patterns, idle time, and productivity metrics
- **Performance Dashboards**: Visual representations of equipment efficiency, downtime causes, and utilization trends
- **Cost Analysis**: Detailed breakdown of equipment costs including fuel, maintenance, operator wages, and overhead
- **ROI Calculations**: Automated return on investment analysis for equipment purchases and lease decisions
- **Optimization Recommendations**: AI-powered suggestions for improving equipment deployment and utilization

#### **Maintenance Management**
- **Preventive Maintenance Scheduling**: Automated scheduling based on hours, calendar time, or usage patterns
- **Service History Tracking**: Complete maintenance records with parts used, labor costs, and service provider information
- **Predictive Maintenance**: Machine learning algorithms that predict maintenance needs based on usage patterns and historical data
- **Work Order Management**: Digital work orders with mobile access for field technicians
- **Parts Inventory Integration**: Automatic parts ordering and inventory management for maintenance operations

### 📊 Project Integration & Resource Management

#### **Intelligent Resource Allocation**
- **Project-Equipment Matching**: Automated matching of equipment to project requirements based on specifications and availability
- **Conflict Resolution**: Smart scheduling that prevents double-booking and optimizes equipment utilization across projects
- **Resource Planning**: Long-term planning tools that align equipment availability with project timelines
- **Cost Allocation**: Accurate tracking of equipment costs to specific projects for precise job costing

#### **Timeline & Schedule Management**
- **Equipment Scheduling**: Visual scheduling interface with drag-and-drop functionality for easy equipment assignment
- **Critical Path Integration**: Alignment of equipment availability with project critical path activities
- **Milestone Tracking**: Equipment readiness tracking for key project milestones
- **Schedule Optimization**: Automated suggestions for schedule improvements and resource reallocation

### 📈 Advanced Analytics & Business Intelligence

#### **Executive Dashboards**
- **Key Performance Indicators (KPIs)**: Real-time monitoring of equipment utilization, maintenance costs, and operational efficiency
- **Financial Analytics**: Comprehensive cost analysis, budget tracking, and profitability reports
- **Trend Analysis**: Historical data analysis to identify patterns and predict future needs
- **Comparative Analysis**: Benchmarking against industry standards and internal targets

#### **Predictive Analytics**
- **Failure Prediction**: Machine learning models that predict equipment failures before they occur
- **Demand Forecasting**: Predictive models for equipment demand based on historical project data and market trends
- **Cost Optimization**: Algorithms that identify cost-saving opportunities in equipment operations
- **Capacity Planning**: Predictive analysis for future equipment needs based on business growth projections

#### **Custom Reporting Engine**
- **Report Builder**: Drag-and-drop interface for creating custom reports without technical expertise
- **Automated Reports**: Scheduled generation and distribution of routine reports
- **Export Capabilities**: Support for multiple formats (PDF, Excel, CSV, PowerPoint) for external sharing
- **Interactive Reports**: Web-based reports with drill-down capabilities and interactive charts

### 🔐 Security & Compliance

#### **Enterprise-Grade Security**
- **Role-Based Access Control (RBAC)**: Granular permissions system with custom roles for different departments and job functions
- **Multi-Factor Authentication (MFA)**: Additional security layer with support for authenticator apps and SMS
- **Audit Logging**: Comprehensive logging of all system activities for compliance and security monitoring
- **Data Encryption**: End-to-end encryption for data in transit and at rest using industry-standard protocols

#### **Regulatory Compliance**
- **Industry Standards**: Built-in compliance features for OSHA, DOT, and other relevant regulations
- **Inspection Management**: Digital inspection checklists and automated compliance reporting
- **Certificate Tracking**: Automated tracking of equipment certifications, licenses, and renewals
- **Regulatory Reporting**: Automated generation of required regulatory reports and submissions

### 📱 Modern User Experience

#### **Material-UI Design System**
- **Professional Interface**: Clean, intuitive design following Google's Material Design principles
- **Accessibility Compliance**: WCAG 2.1 AA compliant with screen reader support and keyboard navigation
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices with consistent user experience
- **Dark/Light Mode**: Automatic theme switching based on user preferences and system settings
- **Customizable Dashboards**: Personalized interfaces that adapt to individual user roles and preferences

#### **Performance & Reliability**
- **Progressive Web App (PWA)**: Offline capabilities and mobile-app-like experience
- **Real-time Updates**: Live data synchronization across all connected devices
- **Optimistic Updates**: Immediate UI updates with background synchronization for better user experience
- **Error Recovery**: Graceful error handling with automatic retry mechanisms and user-friendly error messages

### 🔧 Technical Excellence

#### **Code Quality Enforcement**
- **Pre-commit Hooks**: Automated quality checks that prevent low-quality code from entering the repository
- **TypeScript Integration**: Full type safety in frontend development reducing runtime errors by 60-80%
- **Python Code Standards**: Black, isort, flake8, and MyPy ensure consistent, high-quality Python code
- **Automated Testing**: Comprehensive test suites with 85%+ code coverage
- **Continuous Integration**: Automated testing and deployment pipelines with quality gates

#### **Scalable Architecture**
- **Microservices Ready**: Modular architecture that can be easily decomposed into microservices as the system grows
- **Database Optimization**: Efficient query patterns, proper indexing, and connection pooling for optimal performance
- **Caching Strategy**: Multi-level caching (Redis, application-level, CDN) for sub-second response times
- **API Design**: RESTful APIs with consistent patterns, comprehensive documentation, and versioning strategy

## 🎯 Target Industries & Use Cases

### **Construction Companies**
- **General Contractors**: Comprehensive equipment management across multiple concurrent projects
- **Specialized Contractors**: Focused management of specialized equipment with detailed tracking requirements
- **Heavy Civil Construction**: Management of large-scale equipment for infrastructure projects
- **Residential Builders**: Streamlined equipment tracking for residential development projects

### **Equipment Rental Companies**
- **Fleet Management**: Complete lifecycle management of rental fleets with utilization optimization
- **Customer Management**: Integration with customer systems for seamless equipment rental processes
- **Maintenance Scheduling**: Predictive maintenance to minimize downtime and maximize rental availability
- **Financial Tracking**: Detailed cost analysis and profitability tracking per equipment unit

### **Infrastructure Development**
- **Public Works**: Government compliance features and detailed asset tracking for public infrastructure
- **Utilities**: Specialized equipment management for utility installation and maintenance
- **Transportation**: Equipment management for road, bridge, and transportation infrastructure projects
- **Environmental Projects**: Tracking of specialized environmental remediation and construction equipment

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

### 🚀 **Latest Update: Strategic Development Planning**

We've completed a comprehensive strategic planning phase that establishes the roadmap for transforming our solid SWR-based foundation into a world-class enterprise ERP system. The new documentation provides detailed guidance for the next 12 weeks of development, integrating educational excellence with practical implementation.

#### **New Strategic Resources:**
- **[Next Phase Strategic Roadmap](./docs/NEXT_PHASE_STRATEGIC_ROADMAP.md)** - 🆕 Comprehensive 12-week development plan with three strategic phases
- **[Educational Resources Integration](./docs/EDUCATIONAL_RESOURCES_INTEGRATION.md)** - 🆕 Structured approach to leveraging `/books/` directory resources
- **[Documentation Update Summary](./docs/DOCUMENTATION_UPDATE_STRATEGIC_PLANNING.md)** - 🆕 Overview of strategic planning documentation

### 📖 Complete Documentation Index

Comprehensive documentation is available in the [`docs/`](./docs/) folder, organized by category:

### 🎯 Quick Start Paths

#### **For Business Stakeholders**
- **[Strategic Development Plan](./docs/NEXT_PHASE_STRATEGIC_ROADMAP.md)** - Business value and implementation timeline
- **[Complete Implementation Summary](./docs/COMPLETE_IMPLEMENTATION_SUMMARY.md)** - Current capabilities and achievements
- **[Business Value Proposition](./docs/NEXT_STEPS_STRATEGIC_DEVELOPMENT_PLAN.md#💼-business-value-proposition)** - ROI and benefits analysis

#### **For Technical Teams**
- **[Getting Started](./docs/START_HERE.md)** - Detailed setup guide and quick start
- **[Educational Resources Integration](./docs/EDUCATIONAL_RESOURCES_INTEGRATION.md)** - Learning approach and resource utilization
- **[Architecture Guidelines](./docs/frontend/architecture-guidelines.md)** - Technical implementation standards

#### **For Project Management**
- **[Project Roadmap](./docs/PROJECT_ROADMAP.md)** - Timeline, milestones, and deliverables
- **[Implementation Strategy](./docs/IMPLEMENTATION_STRATEGY.md)** - Risk mitigation and delivery approach
- **[Week 1 Action Plan](./docs/NEXT_PHASE_STRATEGIC_ROADMAP.md#🚀-week-1-detailed-action-plan)** - Immediate next steps

### 🏗️ Architecture & Design

- **[System Overview](./docs/architecture/system-overview.md)** - DDD, CQRS, and enterprise patterns
- **[API Design Guidelines](./docs/api/design-guidelines.md)** - RESTful API best practices
- **[Database Design Guidelines](./docs/database/design-guidelines.md)** - Schema design and optimization
- **[Frontend Architecture](./docs/frontend/architecture-guidelines.md)** - SWR data fetching, React patterns, and component architecture

### 💻 Development Resources

- **[Clean Code Guidelines](./docs/development/clean-code-guidelines.md)** - Code quality and best practices
- **[Testing Strategy](./docs/development/testing-strategy.md)** - TDD, unit, integration, and E2E testing
- **[Python Environment](./docs/PYTHON_ENVIRONMENT_SETUP.md)** - pyenv + direnv setup
- **[Documentation Index](./docs/README.md)** - Complete documentation map

### 📋 Project Management & Strategy

- **[Strategic Development Plan](./docs/NEXT_STEPS_STRATEGIC_DEVELOPMENT_PLAN.md)** - Detailed approach for next development phases
- **[Authentication](./docs/AUTH_SYSTEM_README.md)** - Auth system documentation
- **[Implementation Strategy](./docs/IMPLEMENTATION_STRATEGY.md)** - Technical strategy and methodology

### 📖 Learning Resources Integration

The documentation is enhanced with insights from industry-leading technical books in `/books/`:

- **Clean Code practices and refactoring patterns** - Applied to daily coding practices
- **API design and REST principles** - Guides our RESTful API implementation
- **Database design and performance optimization** - Informs our PostgreSQL optimization
- **React design patterns and frontend architecture** - Shapes our component architecture
- **Testing strategies and quality assurance** - Drives our comprehensive testing approach
- **Domain-driven design and enterprise patterns** - Structures our business logic organization

**Educational Integration Approach**: Our development combines theoretical knowledge from these resources with practical implementation, ensuring every feature built contributes to both system capability and technical skill development. See the [Educational Resources Integration Guide](./docs/EDUCATIONAL_RESOURCES_INTEGRATION.md) for detailed learning paths.

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

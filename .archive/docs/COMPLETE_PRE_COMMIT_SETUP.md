# Complete Pre-commit Setup for Frontend and Backend ✅

## Overview

The Bitcorp ERP project now has comprehensive pre-commit hooks for both frontend (TypeScript/React) and backend (Python/FastAPI) code quality enforcement.

## What's Included

### Frontend Checks
- ✅ **TypeScript Type Checking** - Ensures no type errors
- ✅ **ESLint** - Code style and best practices enforcement

### Backend Checks
- ✅ **Black** - Python code formatter
- ✅ **isort** - Import statement organizer
- ✅ **flake8** - PEP 8 compliance and style checker
- ✅ **MyPy** - Static type checking (when environment is set up)

## Setup Instructions

### 1. Frontend Setup (Already Complete)
The frontend hooks are ready to use immediately.

### 2. Backend Setup
```bash
# Set up Python environment and install code quality tools
./scripts/setup-backend.sh
```

### 3. Manual Backend Setup (Alternative)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## How It Works

### Pre-commit Hook Behavior
The pre-commit hook intelligently handles different scenarios:

1. **Frontend Always Checked** - TypeScript and ESLint run on every commit
2. **Backend Conditionally Checked** - Only runs if Python environment is set up
3. **Graceful Fallback** - If backend tools aren't installed, frontend checks still proceed

### Smart Environment Detection
- Automatically detects `.venv` or `venv` directories
- Checks if required Python packages are installed
- Provides helpful setup instructions when tools are missing

## Build Scripts

### Individual Components
```bash
# Frontend only
./scripts/build-frontend.sh

# Backend only
./scripts/build-backend.sh

# Complete application
./scripts/build-all.sh
```

### Setup Scripts
```bash
# Set up backend Python environment
./scripts/setup-backend.sh
```

## Manual Code Quality Commands

### Frontend
```bash
cd frontend
npm run lint          # Run ESLint
npx tsc --noEmit       # Type check
npm run build          # Production build
```

### Backend
```bash
cd backend
source .venv/bin/activate

# Format and organize
python -m black .
python -m isort .

# Check quality
python -m black --check .
python -m isort --check-only .
python -m flake8 .
python -m mypy app/

# Run tests
python -m pytest tests/
```

## Configuration Files

### Frontend
- `frontend/package.json` - Dependencies and lint-staged config
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/.eslintrc.json` - ESLint rules

### Backend
- `backend/requirements.txt` - Python dependencies (includes code quality tools)
- `backend/pyproject.toml` - Configuration for Black, isort, MyPy, pytest
- `backend/.flake8` - flake8 linter configuration

### Project Root
- `.husky/pre-commit` - Combined pre-commit hook script
- `scripts/` - Build and setup scripts

## Code Quality Standards

### Frontend (TypeScript/React)
- **No TypeScript errors** - All code must type-check
- **ESLint compliance** - Follow Next.js and React best practices
- **Material-UI only** - No Tailwind or other UI frameworks

### Backend (Python/FastAPI)
- **Black formatting** - Consistent code style (88 char line length)
- **Organized imports** - isort handles import organization
- **PEP 8 compliance** - flake8 enforces Python style guide
- **Type annotations** - MyPy checks type hints when available

## Troubleshooting

### Frontend Issues
```bash
# Fix TypeScript errors - check the error messages
cd frontend && npx tsc --noEmit

# Fix ESLint issues
cd frontend && npm run lint
```

### Backend Issues
```bash
# Format code automatically
cd backend
python -m black .
python -m isort .

# Check specific issues
python -m flake8 .        # Style issues
python -m mypy app/       # Type issues
```

### Environment Issues
```bash
# Reset Python environment
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Emergency Bypass

For genuine emergencies only:
```bash
git commit --no-verify -m "Emergency commit message"
```

**Warning**: This bypasses ALL quality checks. Use sparingly!

## Development Workflow

### Recommended Process
1. **Write code** in your preferred editor
2. **Run manual checks** during development
3. **Commit changes** - pre-commit hooks run automatically
4. **Fix any issues** if hooks fail
5. **Retry commit** after fixes

### IDE Integration
- **VS Code**: Install Python, Black Formatter, ESLint extensions
- **PyCharm**: Enable Black, isort, and MyPy integration
- **Other IDEs**: Configure formatters to match our settings

## Benefits

### Code Quality
- **Consistent formatting** across the entire codebase
- **Early error detection** before code reaches CI/CD
- **Best practices enforcement** for both languages

### Team Collaboration
- **Unified standards** for all developers
- **Reduced code review time** on style issues
- **Professional codebase** maintenance

### Deployment Safety
- **Type safety** reduces runtime errors
- **Style consistency** improves maintainability
- **Automated quality** checks prevent issues

---

✅ **The project now has comprehensive code quality enforcement for both frontend and backend!**

Next steps:
1. Set up backend environment with `./scripts/setup-backend.sh`
2. Test the complete workflow with `./scripts/build-all.sh`
3. Continue development with confidence in code quality

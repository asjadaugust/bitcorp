# Backend Pre-commit Hooks Setup

This document describes the code quality enforcement setup for the Python backend.

## Code Quality Tools

The backend uses the following tools for code quality:

### 1. **Black** - Code Formatter
- Automatically formats Python code to a consistent style
- Line length: 88 characters
- Skips migration files

### 2. **isort** - Import Sorter
- Organizes and sorts import statements
- Compatible with Black formatting
- Groups imports logically (standard library, third-party, first-party)

### 3. **flake8** - Linter
- Checks for PEP 8 compliance
- Catches syntax errors and style issues
- Configured to work with Black

### 4. **MyPy** - Type Checker
- Static type checking for Python
- Enforces type annotations
- Helps catch type-related bugs early

## Setup Instructions

### 1. Initial Setup
```bash
# Run the setup script to create virtual environment and install dependencies
./scripts/setup-backend.sh
```

### 2. Manual Setup (Alternative)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Pre-commit Hook Checks

The pre-commit hook automatically runs these checks:

1. **Black formatting check** - Ensures code is formatted correctly
2. **isort import check** - Ensures imports are sorted properly
3. **flake8 linting** - Checks for code style and syntax issues
4. **MyPy type checking** - Validates type annotations

## Manual Commands

### Format Code
```bash
cd backend
source .venv/bin/activate

# Format with Black
python -m black .

# Sort imports
python -m isort .
```

### Check Code Quality
```bash
cd backend
source .venv/bin/activate

# Check formatting (without fixing)
python -m black --check --diff .

# Check import sorting (without fixing)
python -m isort --check-only --diff .

# Run linter
python -m flake8 .

# Run type checker
python -m mypy app/
```

### Run Tests
```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

## Build Scripts

### Backend Only
```bash
./scripts/build-backend.sh
```

### Complete Application
```bash
./scripts/build-all.sh
```

## Configuration Files

- `pyproject.toml` - Configuration for Black, isort, MyPy, and pytest
- `.flake8` - Configuration for flake8 linter
- `requirements.txt` - Python dependencies including code quality tools

## Fixing Common Issues

### Black Formatting Issues
```bash
cd backend && python -m black .
```

### Import Sorting Issues
```bash
cd backend && python -m isort .
```

### Type Checking Issues
- Add proper type annotations to functions
- Use `# type: ignore` for unavoidable issues (sparingly)
- Check MyPy documentation for specific error codes

### Linting Issues
- Follow the error messages from flake8
- Most issues are automatically fixed by Black and isort

## IDE Integration

### VS Code
Install these extensions:
- Python (Microsoft)
- Black Formatter
- isort
- Pylance (for type checking)
- Flake8

### PyCharm
- Enable Black formatter in settings
- Enable isort in settings
- Configure MyPy as external tool

## Bypassing Hooks (Emergency Only)

```bash
git commit --no-verify -m "Emergency commit message"
```

**Warning**: Only use this in genuine emergencies as it bypasses all quality checks.

## Best Practices

1. **Write type annotations** for all functions and class methods
2. **Run formatters regularly** during development
3. **Fix linting issues** as they appear
4. **Write tests** for new functionality
5. **Keep dependencies updated** but test thoroughly

## Troubleshooting

### Virtual Environment Issues
```bash
# Recreate virtual environment
cd backend
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### MyPy Cache Issues
```bash
cd backend
rm -rf .mypy_cache
python -m mypy app/
```

### Import Issues
- Ensure your virtual environment is activated
- Check that all required packages are in requirements.txt
- Verify PYTHONPATH if using custom modules

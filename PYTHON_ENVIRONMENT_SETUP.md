# Python Environment Management with pyenv + direnv

This project uses **pyenv** and **direnv** for automatic Python environment management. This setup provides:

- ✅ Automatic Python version selection when entering the project directory
- ✅ Automatic virtual environment creation and activation
- ✅ Environment variables loaded automatically
- ✅ Separate environments for local development vs Docker

## Quick Start

1. **Navigate to the project directory** - The environment will activate automatically:
   ```bash
   cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
   # 🚀 Bitcorp ERP development environment loaded!
   # 📦 Python Python 3.11.5 with virtual environment activated
   # 🗄️  Database: postgresql://bitcorp:password@localhost:5433/bitcorp_erp
   # 🔴 Redis: redis://localhost:6379/0
   ```

2. **Start the backend** (environment is already configured):
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## How It Works

### Files Created

1. **`.python-version`** - Specifies Python 3.11.0 for pyenv
2. **`.envrc`** - Direnv configuration with:
   - Virtual environment setup
   - Environment variables for local development
   - Automatic PYTHONPATH configuration

### Environment Variables (Local Development)

When you're in the project directory, these are automatically set:

```bash
DATABASE_URL=postgresql://bitcorp:password@localhost:5433/bitcorp_erp
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key-change-in-production-64-chars-min!@#$%^&*()
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_HOSTS=http://localhost:3000,http://localhost:5173
DEBUG=true
ENVIRONMENT=development
```

### Database Connection Logic

- **Local Development**: `localhost:5433` (Docker-mapped port)
- **Docker Compose**: `db:5432` (internal Docker network)

## Installation Requirements

### macOS with Homebrew

```bash
# Install pyenv and direnv (if not already installed)
brew install pyenv direnv

# Add to your shell profile (~/.zshrc)
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

## Default Credentials

```bash
# Developer User
Username: developer@bitcorp.com
Password: developer123!

# Admin User  
Username: admin@bitcorp.com
Password: admin123!
```

## Testing the Setup

1. **Start Docker services**:
   ```bash
   docker-compose up -d db redis
   ```

2. **Navigate to project** (auto-activates environment):
   ```bash
   cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp
   ```

3. **Install dependencies** (if needed):
   ```bash
   pip install -r backend/requirements.txt
   pip install email-validator  # Required for Pydantic email validation
   ```

4. **Initialize database**:
   ```bash
   cd backend
   python app/core/init_db.py
   ```

5. **Start backend**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Test API**:
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Login
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "developer@bitcorp.com", "password": "developer123!"}'
   ```

## Benefits Over Manual venv

✅ **No manual activation** - Environment activates when you enter the directory  
✅ **Consistent Python version** - pyenv ensures everyone uses Python 3.11.0  
✅ **Environment variables included** - Database URLs, secrets, etc. auto-loaded  
✅ **Clean workspace** - Virtual env stored in `.direnv/` (gitignored)  
✅ **Per-project isolation** - Each project gets its own environment  
✅ **Shell integration** - Works with any shell (zsh, bash, fish)  

## Troubleshooting

### Permission Issues
```bash
direnv allow  # Allow .envrc to load
```

### Python Version Issues
```bash
pyenv install 3.11.0  # Install if not available
pyenv local 3.11.0    # Set for project
```

### Environment Variables Not Loading
```bash
direnv reload  # Reload environment
echo $DATABASE_URL  # Check if loaded
```

### Dependencies Missing
```bash
pip install -r backend/requirements.txt
pip install email-validator  # For Pydantic email fields
```

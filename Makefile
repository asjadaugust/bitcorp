# BitCorp ERP - Build and Development Makefile
.PHONY: help install build build-frontend build-backend test lint clean dev dev-frontend dev-backend check-deps logs

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Default target
help:
	@echo "$(BLUE)BitCorp ERP - Available Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev              - Start both frontend and backend in development mode"
	@echo "  make dev-frontend     - Start only frontend development server"
	@echo "  make dev-backend      - Start only backend development server"
	@echo ""
	@echo "$(GREEN)Building:$(NC)"
	@echo "  make build            - Build both frontend and backend"
	@echo "  make build-frontend   - Build only frontend"
	@echo "  make build-backend    - Build only backend (type check)"
	@echo ""
	@echo "$(GREEN)Setup:$(NC)"
	@echo "  make install          - Install all dependencies"
	@echo "  make check-deps       - Check if dependencies are installed"
	@echo ""
	@echo "$(GREEN)Quality:$(NC)"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Run linting for both projects"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "$(GREEN)Debugging:$(NC)"
	@echo "  make logs             - Show recent build logs"
	@echo "  make clear-logs       - Clear all build logs"

# Check if required dependencies are installed
check-deps:
	@echo "$(BLUE)Checking dependencies...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)Error: Node.js is not installed$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)Error: npm is not installed$(NC)"; exit 1; }
	@command -v python3 >/dev/null 2>&1 || { echo "$(RED)Error: Python 3 is not installed$(NC)"; exit 1; }
	@command -v pip >/dev/null 2>&1 || { echo "$(RED)Error: pip is not installed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All required dependencies are installed$(NC)"

# Install all dependencies
install: check-deps
	@echo "$(BLUE)Installing all dependencies...$(NC)"
	@echo "$(YELLOW)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(YELLOW)Installing backend dependencies...$(NC)"
	cd backend && pip install -r requirements.txt
	@echo "$(GREEN)✓ All dependencies installed successfully$(NC)"

# Build both projects
build: build-backend build-frontend
	@echo "$(GREEN)✓ Both frontend and backend built successfully$(NC)"

# Build frontend with error handling
build-frontend:
	@echo "$(BLUE)Building frontend...$(NC)"
	@rm -f build-frontend.log
	@echo "$(YELLOW)Running TypeScript type check...$(NC)"
	@cd frontend && npm run type-check 2>&1 | tee ../build-frontend.log || { \
		echo "$(RED)❌ Frontend TypeScript errors found:$(NC)"; \
		echo "$(RED)=====================================$(NC)"; \
		echo "$(RED)See build-frontend.log for details:$(NC)"; \
		tail -20 ../build-frontend.log; \
		echo "$(RED)=====================================$(NC)"; \
		echo "$(RED)Full log available in: build-frontend.log$(NC)"; \
		exit 1; \
	}
	@echo "$(YELLOW)Building frontend for production...$(NC)"
	@cd frontend && npm run build 2>&1 | tee -a ../build-frontend.log || { \
		echo "$(RED)❌ Frontend build failed:$(NC)"; \
		echo "$(RED)========================$(NC)"; \
		echo "$(RED)See build-frontend.log for details:$(NC)"; \
		tail -30 ../build-frontend.log; \
		echo "$(RED)========================$(NC)"; \
		echo "$(RED)Full log available in: build-frontend.log$(NC)"; \
		exit 1; \
	}
	@echo "$(GREEN)✓ Frontend built successfully$(NC)"
	@echo "$(GREEN)✓ Build log saved to: build-frontend.log$(NC)"

# Build backend with error handling (mainly type checking and validation)
build-backend:
	@echo "$(BLUE)Building backend...$(NC)"
	@rm -f build-backend.log
	@echo "$(YELLOW)Checking Python syntax and imports...$(NC)"
	@cd backend && python -m py_compile app/main.py 2>&1 | tee ../build-backend.log || { \
		echo "$(RED)❌ Backend Python syntax errors found:$(NC)"; \
		echo "$(RED)====================================$(NC)"; \
		echo "$(RED)See build-backend.log for details:$(NC)"; \
		cat ../build-backend.log; \
		echo "$(RED)====================================$(NC)"; \
		echo "$(RED)Full log available in: build-backend.log$(NC)"; \
		exit 1; \
	}
	@echo "$(YELLOW)Testing FastAPI app import...$(NC)"
	@cd backend && python -c "from app.main import app; print('✓ FastAPI app imports successfully')" 2>&1 | tee -a ../build-backend.log || { \
		echo "$(RED)❌ Backend import errors found:$(NC)"; \
		echo "$(RED)==============================$(NC)"; \
		echo "$(RED)See build-backend.log for details:$(NC)"; \
		tail -20 ../build-backend.log; \
		echo "$(RED)==============================$(NC)"; \
		echo "$(RED)Full log available in: build-backend.log$(NC)"; \
		exit 1; \
	}
	@echo "$(YELLOW)Checking database models...$(NC)"
	@cd backend && python -c "from app.models import Equipment, User, Company; print('✓ Database models import successfully')" 2>&1 | tee -a ../build-backend.log || { \
		echo "$(RED)❌ Backend model errors found:$(NC)"; \
		echo "$(RED)=============================$(NC)"; \
		echo "$(RED)See build-backend.log for details:$(NC)"; \
		tail -20 ../build-backend.log; \
		echo "$(RED)=============================$(NC)"; \
		echo "$(RED)Full log available in: build-backend.log$(NC)"; \
		exit 1; \
	}
	@echo "$(GREEN)✓ Backend validation passed$(NC)"
	@echo "$(GREEN)✓ Build log saved to: build-backend.log$(NC)"

# Run tests
test:
	@echo "$(BLUE)Running tests...$(NC)"
	@echo "$(YELLOW)Running frontend tests...$(NC)"
	cd frontend && npm test -- --passWithNoTests || { echo "$(RED)Frontend tests failed$(NC)"; exit 1; }
	@echo "$(YELLOW)Running backend tests...$(NC)"
	cd backend && python -m pytest || { echo "$(RED)Backend tests failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All tests passed$(NC)"

# Run linting
lint:
	@echo "$(BLUE)Running linting...$(NC)"
	@echo "$(YELLOW)Linting frontend...$(NC)"
	cd frontend && npm run lint || { echo "$(RED)Frontend linting failed$(NC)"; exit 1; }
	@echo "$(YELLOW)Linting backend...$(NC)"
	cd backend && python -m flake8 app/ || { echo "$(RED)Backend linting failed$(NC)"; exit 1; }
	@echo "$(GREEN)✓ All linting passed$(NC)"

# Clean build artifacts
clean:
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf frontend/.next
	rm -rf frontend/out
	rm -rf frontend/node_modules/.cache
	rm -rf backend/__pycache__
	rm -rf backend/app/__pycache__
	rm -rf backend/**/__pycache__
	rm -f build-frontend.log
	rm -f build-backend.log
	rm -f dev-frontend.log
	rm -f dev-backend.log
	@echo "$(GREEN)✓ Build artifacts cleaned$(NC)"

# View build logs
logs:
	@echo "$(BLUE)Recent build logs:$(NC)"
	@echo ""
	@if [ -f build-frontend.log ]; then \
		echo "$(YELLOW)Frontend build log (last 20 lines):$(NC)"; \
		echo "$(YELLOW)====================================$(NC)"; \
		tail -20 build-frontend.log; \
		echo ""; \
	else \
		echo "$(YELLOW)No frontend build log found$(NC)"; \
	fi
	@if [ -f build-backend.log ]; then \
		echo "$(YELLOW)Backend build log (last 20 lines):$(NC)"; \
		echo "$(YELLOW)===================================$(NC)"; \
		tail -20 build-backend.log; \
		echo ""; \
	else \
		echo "$(YELLOW)No backend build log found$(NC)"; \
	fi
	@echo "$(BLUE)Full logs available in: build-frontend.log, build-backend.log$(NC)"

# Clear build logs
clear-logs:
	@echo "$(BLUE)Clearing build logs...$(NC)"
	rm -f build-frontend.log build-backend.log dev-frontend.log dev-backend.log
	@echo "$(GREEN)✓ Build logs cleared$(NC)"

# Development servers
dev-frontend:
	@echo "$(BLUE)Starting frontend development server...$(NC)"
	cd frontend && npm run dev

dev-backend:
	@echo "$(BLUE)Starting backend development server...$(NC)"
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev:
	@echo "$(BLUE)Starting both frontend and backend development servers...$(NC)"
	@echo "$(YELLOW)Starting backend server in background...$(NC)"
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../dev-backend.log 2>&1 & echo $$! > ../backend.pid
	@echo "$(YELLOW)Waiting for backend to start...$(NC)"
	@sleep 3
	@echo "$(YELLOW)Starting frontend server...$(NC)"
	cd frontend && npm run dev || { \
		echo "$(RED)Frontend failed to start$(NC)"; \
		if [ -f ../backend.pid ]; then kill `cat ../backend.pid`; rm ../backend.pid; fi; \
		exit 1; \
	}

# Stop background processes
stop:
	@echo "$(BLUE)Stopping background processes...$(NC)"
	@if [ -f backend.pid ]; then \
		kill `cat backend.pid` 2>/dev/null || true; \
		rm backend.pid; \
		echo "$(GREEN)Backend stopped$(NC)"; \
	fi
	@pkill -f "npm run dev" 2>/dev/null || true
	@echo "$(GREEN)All development servers stopped$(NC)"

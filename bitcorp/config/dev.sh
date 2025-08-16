#!/bin/bash

# Bitcorp ERP Development Environment Manager
# This script helps manage the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

print_header() {
    echo -e "${BLUE}🚀 Bitcorp ERP Development Environment${NC}"
    echo -e "${BLUE}======================================${NC}"
}

print_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Initial setup (install dependencies)"
    echo "  start     - Start all services"
    echo "  backend   - Start only backend"
    echo "  frontend  - Start only frontend" 
    echo "  docker    - Start Docker services (db, redis)"
    echo "  test      - Run tests"
    echo "  status    - Check service status"
    echo "  logs      - Show backend logs"
    echo "  clean     - Clean environment"
    echo "  help      - Show this help"
}

check_requirements() {
    echo -e "${YELLOW}Checking requirements...${NC}"
    
    # Check if pyenv is installed
    if ! command -v pyenv &> /dev/null; then
        echo -e "${RED}❌ pyenv not found. Please install with: brew install pyenv${NC}"
        exit 1
    fi
    
    # Check if direnv is installed
    if ! command -v direnv &> /dev/null; then
        echo -e "${RED}❌ direnv not found. Please install with: brew install direnv${NC}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker not running. Please start Docker Desktop${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

setup() {
    print_header
    check_requirements
    
    echo -e "${YELLOW}Setting up development environment...${NC}"
    
    # Allow direnv if needed
    cd "$PROJECT_ROOT"
    if [ -f .envrc ]; then
        direnv allow
    fi
    
    # Install Python dependencies
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r "$BACKEND_DIR/requirements.txt"
    pip install email-validator
    
    # Start Docker services
    echo -e "${YELLOW}Starting Docker services...${NC}"
    docker-compose up -d db redis
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 5
    
    # Initialize database
    echo -e "${YELLOW}Initializing database...${NC}"
    cd "$BACKEND_DIR"
    python app/core/init_db.py
    
    # Install frontend dependencies
    if [ -d "$FRONTEND_DIR" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        cd "$FRONTEND_DIR"
        npm install
    fi
    
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Run: $0 start"
    echo "  2. Open: http://localhost:8000/health (backend)"
    echo "  3. Open: http://localhost:3000 (frontend)"
}

start_docker() {
    echo -e "${YELLOW}Starting Docker services...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose up -d db redis
    docker-compose ps
}

start_backend() {
    echo -e "${YELLOW}Starting backend server...${NC}"
    cd "$BACKEND_DIR"
    
    # Kill existing process
    pkill -f uvicorn || true
    
    # Start backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    
    echo -e "${GREEN}✅ Backend starting on http://localhost:8000${NC}"
}

start_frontend() {
    if [ -d "$FRONTEND_DIR" ]; then
        echo -e "${YELLOW}Starting frontend server...${NC}"
        cd "$FRONTEND_DIR"
        npm run dev &
        echo -e "${GREEN}✅ Frontend starting on http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
    fi
}

start_all() {
    print_header
    start_docker
    sleep 3
    start_backend
    sleep 2
    start_frontend
    
    echo ""
    echo -e "${GREEN}🎉 All services started!${NC}"
    echo -e "${BLUE}Services:${NC}"
    echo "  • Backend:  http://localhost:8000"
    echo "  • Frontend: http://localhost:3000"
    echo "  • pgAdmin:  http://localhost:5050"
    echo ""
    echo -e "${BLUE}Credentials:${NC}"
    echo "  • Developer: developer@bitcorp.com / developer123!"
    echo "  • Admin:     admin@bitcorp.com / admin123!"
}

run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    cd "$BACKEND_DIR"
    python -m pytest
}

show_status() {
    print_header
    
    echo -e "${BLUE}Docker Services:${NC}"
    cd "$PROJECT_ROOT"
    docker-compose ps
    
    echo ""
    echo -e "${BLUE}Backend Process:${NC}"
    if pgrep -f uvicorn > /dev/null; then
        echo -e "${GREEN}✅ Backend running${NC}"
    else
        echo -e "${RED}❌ Backend not running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}API Health Check:${NC}"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API responding${NC}"
    else
        echo -e "${RED}❌ API not responding${NC}"
    fi
}

show_logs() {
    echo -e "${YELLOW}Backend logs:${NC}"
    if [ -f "$BACKEND_DIR/server.log" ]; then
        tail -f "$BACKEND_DIR/server.log"
    else
        echo "No log file found. Backend may not be running."
    fi
}

clean() {
    echo -e "${YELLOW}Cleaning environment...${NC}"
    
    # Stop processes
    pkill -f uvicorn || true
    pkill -f "npm run dev" || true
    
    # Stop Docker services
    cd "$PROJECT_ROOT"
    docker-compose down
    
    # Remove log files
    rm -f "$BACKEND_DIR/server.log"
    
    echo -e "${GREEN}✅ Environment cleaned${NC}"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup
        ;;
    start)
        start_all
        ;;
    backend)
        start_docker
        sleep 3
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    docker)
        start_docker
        ;;
    test)
        run_tests
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean
        ;;
    help|*)
        print_usage
        ;;
esac

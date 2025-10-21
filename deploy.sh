#!/bin/bash
# ==============================================================================
# Bitcorp ERP - Production Deployment Script
# ==============================================================================
#
# Quick deployment for Synology NAS or any Docker environment
#
# Usage:
#   ./deploy.sh          # Deploy/update all services
#   ./deploy.sh down     # Stop all services
#   ./deploy.sh reset    # Reset database (WARNING: destroys data!)
#   ./deploy.sh logs     # View all logs
#
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        log_warn ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warn "Please edit .env and set secure passwords!"
            log_warn "Then run this script again."
            exit 1
        else
            log_error ".env.example not found!"
            exit 1
        fi
    fi
}

# Check if SSL certificates exist
check_ssl() {
    if [ ! -f nginx/ssl/cert.pem ] || [ ! -f nginx/ssl/key.pem ]; then
        log_warn "SSL certificates not found in nginx/ssl/"
        log_warn "The application will fail to start without certificates."
        log_warn "See nginx/ssl/README.md for instructions."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Deploy services
deploy() {
    log_info "Starting Bitcorp ERP deployment..."
    
    check_env
    check_ssl
    
    log_info "Building and starting services..."
    docker-compose up -d --build
    
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    log_info "Checking service status..."
    docker-compose ps
    
    log_info ""
    log_info "Deployment complete!"
    log_info "Access the application at: https://bitcorp.mohammadasjad.com"
    log_info ""
    log_info "To initialize the database, run:"
    log_info "  docker-compose exec backend python -c \"from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())\""
}

# Stop services
stop() {
    log_info "Stopping all services..."
    docker-compose down
    log_info "Services stopped."
}

# Reset database (DANGEROUS)
reset() {
    log_error "WARNING: This will DELETE ALL DATA!"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    if [ "$confirm" != "yes" ]; then
        log_info "Reset cancelled."
        exit 0
    fi
    
    log_info "Stopping and removing all containers and volumes..."
    docker-compose down -v
    
    log_info "Rebuilding and starting services..."
    docker-compose up -d --build
    
    log_info "Waiting for database to be ready..."
    sleep 15
    
    log_info "Initializing database..."
    docker-compose exec backend python -c "from app.core.init_db import initialize_database; from app.core.database import SessionLocal; initialize_database(SessionLocal())"
    
    log_info "Database reset complete!"
}

# Show logs
logs() {
    log_info "Showing logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Main script
case "${1:-deploy}" in
    deploy|up)
        deploy
        ;;
    down|stop)
        stop
        ;;
    reset)
        reset
        ;;
    logs)
        logs
        ;;
    *)
        echo "Usage: $0 {deploy|down|reset|logs}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy/update all services (default)"
        echo "  down    - Stop all services"
        echo "  reset   - Reset database (WARNING: destroys data!)"
        echo "  logs    - View all logs"
        exit 1
        ;;
esac

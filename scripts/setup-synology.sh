#!/bin/bash
# ==============================================================================
# Bitcorp ERP - Synology Setup Script
# ==============================================================================
#
# This script automates the initial setup of Bitcorp ERP on Synology NAS.
# Run this script ONCE during initial deployment.
#
# USAGE:
#   sudo bash setup-synology.sh
#
# WHAT IT DOES:
# 1. Creates required directories
# 2. Sets proper permissions
# 3. Generates secure passwords
# 4. Creates .env file
# 5. Validates configuration
# 6. Provides next steps
#
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RUNTIME_DIR="/volume1/docker/bitcorp"
CODEBASE_DIR="/volume1/PeruFamilyDocs/BitCorp/bitcorp"
LOGS_DIR="${CODEBASE_DIR}/backend/logs"
BACKUP_DIR="${CODEBASE_DIR}/database/backups"

# ==============================================================================
# Helper Functions
# ==============================================================================

print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

generate_secret_key() {
    openssl rand -hex 64
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    fi
    print_success "$1 is available"
    return 0
}

# ==============================================================================
# Pre-flight Checks
# ==============================================================================

preflight_checks() {
    print_header "Pre-flight Checks"
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run as root (use: sudo bash setup-synology.sh)"
        exit 1
    fi
    print_success "Running as root"
    
    # Check required commands
    check_command docker || exit 1
    check_command docker-compose || exit 1
    check_command openssl || exit 1
    
    # Check if codebase exists
    if [ ! -d "${CODEBASE_DIR}" ]; then
        print_error "Codebase directory not found: ${CODEBASE_DIR}"
        print_info "Please ensure code is at: ${CODEBASE_DIR}"
        exit 1
    fi
    print_success "Codebase directory found"
    
    # Check if docker-compose.yml exists
    if [ ! -f "${CODEBASE_DIR}/docker-compose.synology.yml" ]; then
        print_error "Docker Compose file not found: ${CODEBASE_DIR}/docker-compose.synology.yml"
        exit 1
    fi
    print_success "Docker Compose file found"
    
    # Check if .env.synology.example exists
    if [ ! -f "${CODEBASE_DIR}/.env.synology.example" ]; then
        print_error "Environment example file not found: ${CODEBASE_DIR}/.env.synology.example"
        exit 1
    fi
    print_success "Environment example file found"
    
    echo ""
}

# ==============================================================================
# Directory Setup
# ==============================================================================

setup_directories() {
    print_header "Setting Up Directories"
    
    # Create runtime directory
    if [ ! -d "${RUNTIME_DIR}" ]; then
        mkdir -p "${RUNTIME_DIR}"
        print_success "Created runtime directory: ${RUNTIME_DIR}"
    else
        print_info "Runtime directory already exists: ${RUNTIME_DIR}"
    fi
    
    # Create logs directory
    if [ ! -d "${LOGS_DIR}" ]; then
        mkdir -p "${LOGS_DIR}"
        print_success "Created logs directory: ${LOGS_DIR}"
    else
        print_info "Logs directory already exists: ${LOGS_DIR}"
    fi
    
    # Create backup directory
    if [ ! -d "${BACKUP_DIR}" ]; then
        mkdir -p "${BACKUP_DIR}"
        print_success "Created backup directory: ${BACKUP_DIR}"
    else
        print_info "Backup directory already exists: ${BACKUP_DIR}"
    fi
    
    # Set permissions
    chown -R 1000:1000 "${LOGS_DIR}"
    chmod -R 755 "${LOGS_DIR}"
    print_success "Set permissions for logs directory"
    
    chown -R 1000:1000 "${BACKUP_DIR}"
    chmod -R 755 "${BACKUP_DIR}"
    print_success "Set permissions for backup directory"
    
    echo ""
}

# ==============================================================================
# Configuration Setup
# ==============================================================================

setup_configuration() {
    print_header "Configuring Environment"
    
    # Copy docker-compose.yml
    if [ -f "${RUNTIME_DIR}/docker-compose.yml" ]; then
        print_warning "docker-compose.yml already exists, creating backup"
        cp "${RUNTIME_DIR}/docker-compose.yml" "${RUNTIME_DIR}/docker-compose.yml.backup"
    fi
    
    cp "${CODEBASE_DIR}/docker-compose.synology.yml" "${RUNTIME_DIR}/docker-compose.yml"
    print_success "Copied docker-compose.yml to runtime directory"
    
    # Generate passwords
    print_info "Generating secure passwords..."
    POSTGRES_PASSWORD=$(generate_password)
    REDIS_PASSWORD=$(generate_password)
    SECRET_KEY=$(generate_secret_key)
    PGADMIN_PASSWORD=$(generate_password)
    
    print_success "Generated secure credentials"
    
    # Get Synology IP
    print_info "Detecting Synology IP address..."
    SYNOLOGY_IP=$(ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -1)
    
    if [ -z "${SYNOLOGY_IP}" ]; then
        SYNOLOGY_IP="192.168.1.100"
        print_warning "Could not detect IP, using default: ${SYNOLOGY_IP}"
        print_info "You can change this later in .env file"
    else
        print_success "Detected Synology IP: ${SYNOLOGY_IP}"
    fi
    
    # Create .env file
    if [ -f "${RUNTIME_DIR}/.env" ]; then
        print_warning ".env file already exists, creating backup"
        cp "${RUNTIME_DIR}/.env" "${RUNTIME_DIR}/.env.backup"
    fi
    
    cat > "${RUNTIME_DIR}/.env" <<EOF
# ==============================================================================
# Bitcorp ERP - Synology Environment Configuration
# Generated: $(date)
# ==============================================================================

# ------------------------------------------------------------------------------
# POSTGRESQL DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
POSTGRES_DB=bitcorp_erp
POSTGRES_USER=bitcorp
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5433

# ------------------------------------------------------------------------------
# REDIS CONFIGURATION
# ------------------------------------------------------------------------------
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_PORT=6379

# ------------------------------------------------------------------------------
# BACKEND API CONFIGURATION
# ------------------------------------------------------------------------------
BACKEND_PORT=8000

# JWT Secret Key - Generated securely
SECRET_KEY=${SECRET_KEY}

# Token expiration settings
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=production

# CORS Configuration
CORS_ALLOW_ORIGINS=["http://localhost:3000","http://${SYNOLOGY_IP}:3000"]
CORS_ALLOW_METHODS=["GET","POST","PUT","DELETE","OPTIONS","PATCH"]
CORS_ALLOW_HEADERS=["*"]
CORS_ALLOW_CREDENTIALS=true

# Logging
LOG_LEVEL=INFO

# ------------------------------------------------------------------------------
# FRONTEND CONFIGURATION
# ------------------------------------------------------------------------------
FRONTEND_PORT=3000

# API URL - Update if using different hostname
NEXT_PUBLIC_API_URL=http://${SYNOLOGY_IP}:8000

# Application name
NEXT_PUBLIC_APP_NAME=Bitcorp ERP

# Node environment
NODE_ENV=production

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=es
NEXT_PUBLIC_SUPPORTED_LOCALES=es,en

# ------------------------------------------------------------------------------
# PGADMIN CONFIGURATION
# ------------------------------------------------------------------------------
PGADMIN_PORT=5050
PGADMIN_EMAIL=admin@bitcorp.com
PGADMIN_PASSWORD=${PGADMIN_PASSWORD}
EOF
    
    chmod 600 "${RUNTIME_DIR}/.env"
    print_success "Created .env file with secure permissions"
    
    # Save credentials to file for reference
    CREDS_FILE="${RUNTIME_DIR}/CREDENTIALS.txt"
    cat > "${CREDS_FILE}" <<EOF
# ==============================================================================
# Bitcorp ERP - Generated Credentials
# Generated: $(date)
# ==============================================================================
# 
# ⚠️  KEEP THIS FILE SECURE! ⚠️
# Store this file in a safe location and delete after recording credentials.
#
# ==============================================================================

PostgreSQL Database:
  Host: ${SYNOLOGY_IP}
  Port: 5433
  Database: bitcorp_erp
  Username: bitcorp
  Password: ${POSTGRES_PASSWORD}

Redis:
  Host: ${SYNOLOGY_IP}
  Port: 6379
  Password: ${REDIS_PASSWORD}

pgAdmin (Database Management UI):
  URL: http://${SYNOLOGY_IP}:5050
  Email: admin@bitcorp.com
  Password: ${PGADMIN_PASSWORD}

JWT Secret Key:
  ${SECRET_KEY}

Application URLs:
  Frontend: http://${SYNOLOGY_IP}:3000
  Backend API: http://${SYNOLOGY_IP}:8000
  API Docs: http://${SYNOLOGY_IP}:8000/docs

Test Credentials (from seed data):
  Operator: john.operator / operator123
  Admin: (check seed_data.py)

==============================================================================
EOF
    
    chmod 600 "${CREDS_FILE}"
    print_success "Saved credentials to: ${CREDS_FILE}"
    print_warning "Please store these credentials securely and delete the file!"
    
    echo ""
}

# ==============================================================================
# Validation
# ==============================================================================

validate_setup() {
    print_header "Validating Configuration"
    
    # Check docker-compose.yml syntax
    cd "${RUNTIME_DIR}"
    if docker-compose config > /dev/null 2>&1; then
        print_success "Docker Compose configuration is valid"
    else
        print_error "Docker Compose configuration has errors"
        docker-compose config
        exit 1
    fi
    
    # Check .env file
    if [ -f "${RUNTIME_DIR}/.env" ]; then
        print_success ".env file exists"
    else
        print_error ".env file not found"
        exit 1
    fi
    
    # Check required ports are available
    print_info "Checking port availability..."
    
    for port in 3000 8000 5433 6379 5050; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "Port $port is already in use"
            print_info "You may need to change this port in .env file"
        else
            print_success "Port $port is available"
        fi
    done
    
    echo ""
}

# ==============================================================================
# Next Steps
# ==============================================================================

show_next_steps() {
    print_header "Setup Complete! 🎉"
    
    cat <<EOF
${GREEN}Setup completed successfully!${NC}

${BLUE}📋 Next Steps:${NC}

1. Review generated credentials:
   ${YELLOW}cat ${RUNTIME_DIR}/CREDENTIALS.txt${NC}

2. (Optional) Edit configuration:
   ${YELLOW}nano ${RUNTIME_DIR}/.env${NC}

3. Pull Docker images:
   ${YELLOW}cd ${RUNTIME_DIR}
   docker-compose pull${NC}

4. Build custom images:
   ${YELLOW}docker-compose build --no-cache${NC}

5. Start all services:
   ${YELLOW}docker-compose up -d${NC}

6. Monitor startup (wait 2-3 minutes):
   ${YELLOW}docker-compose logs -f${NC}
   ${YELLOW}(Press Ctrl+C to stop following logs)${NC}

7. Check service status:
   ${YELLOW}docker-compose ps${NC}

8. Initialize database:
   ${YELLOW}docker-compose exec backend alembic upgrade head
   docker-compose exec backend python scripts/seed_data.py${NC}

9. Access application:
   ${YELLOW}Frontend: http://${SYNOLOGY_IP}:3000
   Backend:  http://${SYNOLOGY_IP}:8000/docs
   pgAdmin:  http://${SYNOLOGY_IP}:5050${NC}

${BLUE}📚 Documentation:${NC}
   ${YELLOW}Full guide: ${CODEBASE_DIR}/docs/SYNOLOGY_DEPLOYMENT_GUIDE.md${NC}

${RED}⚠️  Important Security Notes:${NC}
   - Delete CREDENTIALS.txt after storing passwords securely
   - Update CORS settings in backend/app/core/config.py if needed
   - Disable pgAdmin in production (comment out in docker-compose.yml)
   - Enable HTTPS via Synology reverse proxy
   - Configure firewall rules to restrict access

${GREEN}Need help?${NC}
   - Check logs: docker-compose logs -f
   - Review guide: docs/SYNOLOGY_DEPLOYMENT_GUIDE.md
   - Report issues: https://github.com/asjadaugust/bitcorp/issues

EOF
}

# ==============================================================================
# Main Execution
# ==============================================================================

main() {
    clear
    cat <<EOF
${BLUE}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║               Bitcorp ERP - Synology Setup                  ║
║                                                              ║
║          Automated Installation & Configuration             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${NC}

EOF
    
    preflight_checks
    setup_directories
    setup_configuration
    validate_setup
    show_next_steps
    
    print_success "Setup script completed successfully!"
    echo ""
}

# Run main function
main

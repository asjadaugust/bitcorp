#!/bin/bash
# ==============================================================================
# Fix PostgreSQL Permission Issues on Synology
# ==============================================================================
#
# Run this script if you encounter:
# "ls: can't open '/docker-entrypoint-initdb.d/': Permission denied"
#
# Usage: sudo bash scripts/fix-postgres-permissions.sh
#
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Fixing PostgreSQL Permissions on Synology             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use: sudo bash scripts/fix-postgres-permissions.sh)${NC}"
    exit 1
fi

# Define directories
INIT_SCRIPTS_DIR="/volume1/PeruFamilyDocs/BitCorp/bitcorp/kubernetes/init-scripts"
BACKUP_DIR="/volume1/PeruFamilyDocs/BitCorp/bitcorp/database/backups"

echo -e "${YELLOW}Fixing permissions for PostgreSQL directories...${NC}\n"

# Check and create init-scripts directory if it doesn't exist
if [ ! -d "${INIT_SCRIPTS_DIR}" ]; then
    echo -e "${YELLOW}⚠️  Init scripts directory doesn't exist, creating...${NC}"
    mkdir -p "${INIT_SCRIPTS_DIR}"
    echo -e "${GREEN}✅ Created: ${INIT_SCRIPTS_DIR}${NC}"
fi

# Fix permissions for init-scripts
echo -e "${BLUE}Setting permissions for init-scripts directory...${NC}"
chmod -R 755 "${INIT_SCRIPTS_DIR}"
chown -R 999:999 "${INIT_SCRIPTS_DIR}"
echo -e "${GREEN}✅ Fixed permissions: ${INIT_SCRIPTS_DIR}${NC}"

# Check and create backup directory if it doesn't exist
if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${YELLOW}⚠️  Backup directory doesn't exist, creating...${NC}"
    mkdir -p "${BACKUP_DIR}"
    echo -e "${GREEN}✅ Created: ${BACKUP_DIR}${NC}"
fi

# Fix permissions for backups
echo -e "${BLUE}Setting permissions for backup directory...${NC}"
chmod -R 755 "${BACKUP_DIR}"
chown -R 999:999 "${BACKUP_DIR}"
echo -e "${GREEN}✅ Fixed permissions: ${BACKUP_DIR}${NC}"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Permissions fixed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Restart PostgreSQL container:"
echo -e "   ${YELLOW}cd /volume1/docker/bitcorp${NC}"
echo -e "   ${YELLOW}docker-compose restart db${NC}\n"
echo -e "2. Check container health:"
echo -e "   ${YELLOW}docker-compose ps${NC}\n"
echo -e "3. View logs:"
echo -e "   ${YELLOW}docker-compose logs -f db${NC}\n"

echo -e "${YELLOW}Note: PostgreSQL container runs as user 999:999 (postgres user)${NC}"
echo -e "${YELLOW}If issues persist, the init-scripts mount can be removed from docker-compose.yml${NC}\n"

#!/bin/bash

#===============================================================================
# Fix Production Deployment on Synology - Run from Local Machine
#===============================================================================
# This script connects to Synology and fixes the production deployment
# Run: ./fix-production-remotely.sh
#===============================================================================

set -e  # Exit on error

SYNOLOGY_HOST="mohammad@mohammadasjad.com"
SYNOLOGY_PORT="2230"
PROJECT_PATH="/volume1/PeruFamilyDocs/BitCorp/bitcorp"

echo "=========================================="
echo "Bitcorp Production Fix Script"
echo "=========================================="
echo ""

# Function to run commands on Synology
run_remote() {
    ssh -p $SYNOLOGY_PORT $SYNOLOGY_HOST "$1"
}

echo "Step 1: Checking Synology connection..."
if ! run_remote "echo 'Connected successfully'"; then
    echo "ERROR: Could not connect to Synology"
    exit 1
fi
echo "✓ Connected to Synology"
echo ""

echo "Step 2: Checking current container status..."
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker ps -a | grep bitcorp" || true
echo ""

echo "Step 3: Stopping all containers..."
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker-compose down"
echo "✓ Containers stopped"
echo ""

echo "Step 4: Verifying configuration files..."
echo "Checking API_V1_STR in config.py..."
run_remote "cd $PROJECT_PATH && grep 'API_V1_STR' backend/app/core/config.py"
echo ""

echo "Step 5: Building backend container..."
echo "This may take a few minutes..."
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker-compose build backend"
echo "✓ Backend built successfully"
echo ""

echo "Step 6: Starting all services..."
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker-compose up -d"
echo "✓ Services starting..."
echo ""

echo "Step 7: Waiting for services to initialize..."
sleep 15
echo ""

echo "Step 8: Checking container status..."
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker-compose ps"
echo ""

echo "Step 9: Checking backend logs..."
echo "Last 30 lines of backend logs:"
run_remote "cd $PROJECT_PATH && sudo /usr/local/bin/docker-compose logs backend | tail -30" || echo "Backend container may still be starting..."
echo ""

echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Wait 30 seconds for all services to fully start"
echo "2. Test login at: https://bitcorp.mohammadasjad.com/en/login"
echo "3. Use credentials: developer@bitcorp.com / developer123!"
echo ""
echo "If login still fails, check logs:"
echo "  ssh -p $SYNOLOGY_PORT $SYNOLOGY_HOST"
echo "  cd $PROJECT_PATH"
echo "  sudo /usr/local/bin/docker-compose logs backend"
echo ""


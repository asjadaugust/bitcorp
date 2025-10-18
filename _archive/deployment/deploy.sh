#!/bin/bash

set -e

echo "🚀 Bitcorp ERP - Simplified Production Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}⚠️  .env.production not found!${NC}"
    echo "Creating from template..."
    cp .env.production.example .env.production
    echo -e "${YELLOW}✅ Please edit .env.production with your settings before deploying${NC}"
    echo ""
    echo "Required changes:"
    echo "  - POSTGRES_PASSWORD"
    echo "  - REDIS_PASSWORD"
    echo "  - SECRET_KEY"
    echo "  - NEXT_PUBLIC_API_URL"
    echo "  - BACKEND_CORS_ORIGINS"
    echo ""
    exit 1
fi

# Load environment variables
source .env.production

echo "📋 Configuration loaded:"
echo "   Frontend Port: ${FRONTEND_PORT:-3000}"
echo "   Backend Port:  ${BACKEND_PORT:-8000}"
echo "   pgAdmin Port:  ${PGADMIN_PORT:-5050}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Build services
echo "🔨 Building Docker images (this may take several minutes)..."
docker-compose -f docker-compose.prod.yml build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services.${NC}"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be healthy (may take up to 60 seconds)..."
sleep 15

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend API: http://localhost:${BACKEND_PORT:-8000}"
echo "   API Docs: http://localhost:${BACKEND_PORT:-8000}/docs"
if docker-compose -f docker-compose.prod.yml ps | grep -q pgadmin; then
    echo "   pgAdmin: http://localhost:${PGADMIN_PORT:-5050}"
fi
echo ""
echo "📝 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop all:     docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "   Status:       docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🔐 Default credentials:"
echo "   Username: admin"
echo "   Password: admin123 (change this in production!)"
echo ""

#!/bin/bash

# Bitcorp ERP - Remote Deployment Script for Synology NAS
# This script deploys to mohammadasjad.com

set -e

SERVER="mohammad@mohammadasjad.com"
PORT="2230"
REMOTE_DIR="/volume1/docker/bitcorp"
LOCAL_DIR="."

echo "🚀 Bitcorp ERP - Remote Deployment to Synology NAS"
echo "===================================================="
echo ""
echo "Server: $SERVER"
echo "Remote Directory: $REMOTE_DIR"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo "Please create it from .env.production.example"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
TEMP_DIR=$(mktemp -d)
DEPLOY_PKG="$TEMP_DIR/bitcorp-deploy.tar.gz"

# Copy necessary files
mkdir -p $TEMP_DIR/bitcorp
cp -r backend $TEMP_DIR/bitcorp/ 2>/dev/null || echo "Warning: backend directory not found"
cp -r frontend $TEMP_DIR/bitcorp/ 2>/dev/null || echo "Warning: frontend directory not found"
cp -r docker $TEMP_DIR/bitcorp/
cp -r backup $TEMP_DIR/bitcorp/
cp docker-compose.prod.yml $TEMP_DIR/bitcorp/
cp .env.production $TEMP_DIR/bitcorp/
cp deploy.sh $TEMP_DIR/bitcorp/
cp README.deployment.md $TEMP_DIR/bitcorp/ 2>/dev/null || true

# Create tarball
cd $TEMP_DIR
tar czf bitcorp-deploy.tar.gz bitcorp/
cd -

echo "✅ Package created: $(du -h $DEPLOY_PKG | cut -f1)"
echo ""

# Upload to server
echo "📤 Uploading to remote server..."
ssh -p $PORT $SERVER "mkdir -p $REMOTE_DIR"
scp -P $PORT $DEPLOY_PKG $SERVER:$REMOTE_DIR/

echo "✅ Upload complete"
echo ""

# Extract and deploy on remote server
echo "🔨 Deploying on remote server..."
ssh -p $PORT $SERVER << 'ENDSSH'
cd /volume1/docker/bitcorp
tar xzf bitcorp-deploy.tar.gz
cd bitcorp

echo "🐳 Starting Docker deployment..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found on remote server"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
echo "🔨 Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "▶️  Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health checks
echo "⏳ Waiting for services to be healthy..."
sleep 20

# Check status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend:  http://mohammadasjad.com:30000"
    echo "   Backend:   http://mohammadasjad.com:30001"
    echo "   API Docs:  http://mohammadasjad.com:30001/docs"
    echo "   pgAdmin:   http://mohammadasjad.com:30002"
    echo ""
    echo "📝 To view logs:"
    echo "   ssh -p $PORT $SERVER 'cd $REMOTE_DIR/bitcorp && docker-compose -f docker-compose.prod.yml logs -f'"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi

# Cleanup
rm -rf $TEMP_DIR

echo "🎉 All done!"

#!/bin/bash

# 🚀 Bitcorp ERP Quick Start Script
# Start all services with a single command

echo "🏢 Starting Bitcorp ERP System..."
echo "📁 New architecture following Propuesta.md specifications"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start all services
echo "🐳 Starting all services..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access Points:"
echo "   • Frontend:        http://localhost:3000"
echo "   • Backend API:     http://localhost:8000"
echo "   • API Docs:        http://localhost:8000/docs"
echo "   • Database Admin:  http://localhost:5050"
echo ""
echo "🔑 Default Database Admin Login:"
echo "   • Email:    admin@bitcorp.com"
echo "   • Password: admin123"
echo ""
echo "✅ Bitcorp ERP is ready!"
echo "📚 Check README.md for more information"

#!/bin/bash

# 🛑 Bitcorp ERP Stop Script
# Stop all services gracefully

echo "🛑 Stopping Bitcorp ERP System..."

# Stop all services
docker-compose down

echo "✅ All services stopped"
echo "💡 To start again: ./start.sh or docker-compose up -d"

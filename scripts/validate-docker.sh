#!/bin/bash
set -e

echo "🧪 Running Docker Compose validation tests..."

# Test Frontend
echo "🌐 Testing Frontend (port 3000)..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Test Backend API
echo "🔧 Testing Backend API (port 8000)..."
if curl -s -f http://localhost:8000/docs > /dev/null; then
    echo "✅ Backend API docs are accessible"
else
    echo "❌ Backend API is not responding"
    exit 1
fi

# Test Backend Health
echo "🏥 Testing Backend Health..."
if curl -s -f http://localhost:8000/health > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health endpoint not available (this is optional)"
fi

# Test PostgreSQL connection
echo "🗄️  Testing PostgreSQL connection..."
if docker-compose exec -T db pg_isready -U bitcorp > /dev/null; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
    exit 1
fi

# Test Redis connection
echo "🔴 Testing Redis connection..."
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is responding"
else
    echo "❌ Redis is not responding"
    exit 1
fi

echo ""
echo "🎉 All Docker Compose services are working correctly!"
echo "📋 Service Status:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000"
echo "   - Backend Docs: http://localhost:8000/docs"
echo "   - PgAdmin: http://localhost:5050"
echo "   - PostgreSQL: localhost:5433"
echo "   - Redis: localhost:6379"

#!/bin/bash
# Production Fix Script for Synology
# Run this on your Synology NAS

echo "🔧 Bitcorp ERP - Production Fix"
echo "================================"

cd /volume1/PeruFamilyDocs/BitCorp/bitcorp

echo ""
echo "1️⃣ Stopping containers..."
sudo docker-compose down

echo ""
echo "2️⃣ Rebuilding backend (with new API_V1_STR=/v1)..."
sudo docker-compose build backend

echo ""
echo "3️⃣ Rebuilding frontend (with correct credentials)..."
sudo docker-compose build frontend

echo ""
echo "4️⃣ Starting all services..."
sudo docker-compose up -d

echo ""
echo "5️⃣ Waiting for services to be ready..."
sleep 10

echo ""
echo "6️⃣ Checking service status..."
sudo docker-compose ps

echo ""
echo "7️⃣ Checking backend logs..."
sudo docker-compose logs --tail=20 backend

echo ""
echo "✅ Done! Test at https://bitcorp.mohammadasjad.com"
echo ""
echo "📝 Credentials:"
echo "   Admin: admin@bitcorp.com / admin123!"
echo "   Developer: developer@bitcorp.com / developer123!"
echo "   Operator: john.operator@bitcorp.com / operator123"

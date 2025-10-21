#!/bin/bash

echo "🧪 Testing Backend Connection and CORS..."
echo "============================================"

# Test if backend is running
echo "1. Testing backend health endpoint..."
curl -s http://localhost:8000/health | jq . 2>/dev/null || echo "❌ Backend not responding or jq not installed"

echo -e "\n2. Testing CORS preflight request..."
curl -s -X OPTIONS http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v 2>&1 | grep -E "(Access-Control|HTTP/|Origin)"

echo -e "\n3. Testing actual POST request with CORS headers..."
response=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -w "\nHTTP_CODE:%{http_code}\n")

echo "$response"

echo -e "\n4. Testing database connection via API..."
curl -s http://localhost:8000/api/v1/auth/users | head -c 200 2>/dev/null || echo "❌ Users endpoint failed"

echo -e "\n✅ Backend test completed. Check for any 500 errors above."

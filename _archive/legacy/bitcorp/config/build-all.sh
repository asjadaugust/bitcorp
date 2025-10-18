#!/bin/bash

echo "🚀 Building Complete Bitcorp ERP Application..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "❌ Please run this script from the project root directory"
  exit 1
fi

echo "🐍 Building Backend..."
./scripts/build-backend.sh

if [ $? -ne 0 ]; then
  echo "❌ Backend build failed!"
  exit 1
fi

echo ""
echo "📱 Building Frontend..."
./scripts/build-frontend.sh

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi

echo ""
echo "✅ Complete application build successful!"
echo "🎉 Both frontend and backend are ready for deployment."
echo ""
echo "Next steps:"
echo "  - Frontend build output: frontend/.next/"
echo "  - Backend is ready to run with: cd backend && python start.py"
echo "  - Or use Docker: docker-compose up"

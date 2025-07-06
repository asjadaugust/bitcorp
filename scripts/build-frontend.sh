#!/bin/bash

echo "🔄 Building Bitcorp ERP Frontend..."
echo "=================================="

cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running TypeScript type check..."
npx tsc --noEmit --skipLibCheck

if [ $? -ne 0 ]; then
  echo "❌ TypeScript type check failed!"
  exit 1
fi

echo "🔍 Running linter..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting failed!"
  exit 1
fi

echo "📦 Running production build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ All checks passed! Ready for deployment."
echo "📦 Build output is in frontend/.next/"

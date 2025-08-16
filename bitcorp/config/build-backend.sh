#!/bin/bash

echo "🐍 Building and Testing Bitcorp ERP Backend..."
echo "============================================="

cd backend

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
  echo "🔧 Activating virtual environment..."
  source .venv/bin/activate
elif [ -d "venv" ]; then
  echo "🔧 Activating virtual environment..."
  source venv/bin/activate
else
  echo "❌ No virtual environment found! Please run ./scripts/setup-backend.sh first"
  exit 1
fi

echo "📦 Installing/updating dependencies..."
pip install -r requirements.txt

echo "🔧 Formatting code with Black..."
python -m black .

echo "🔧 Sorting imports with isort..."
python -m isort .

echo "🔍 Running flake8 linter..."
python -m flake8 .

if [ $? -ne 0 ]; then
  echo "❌ Linting failed!"
  exit 1
fi

echo "🔍 Running mypy type check..."
python -m mypy app/

if [ $? -ne 0 ]; then
  echo "❌ Type checking failed!"
  exit 1
fi

echo "🧪 Running tests..."
python -m pytest tests/ -v

if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

echo "🔍 Running security checks..."
if command -v bandit &> /dev/null; then
  python -m bandit -r app/ -f json -o bandit-report.json
  echo "📊 Security report saved to bandit-report.json"
else
  echo "⚠️  Bandit not installed, skipping security checks"
fi

echo "✅ All backend checks passed! Ready for deployment."

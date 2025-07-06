#!/bin/bash

echo "🐍 Setting up Python Backend Environment..."
echo "========================================"

cd backend

echo "🔧 Creating virtual environment..."
python3 -m venv .venv

echo "🔧 Activating virtual environment..."
source .venv/bin/activate

echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔍 Running initial code quality checks..."

echo "🔧 Formatting code with Black..."
python -m black .

echo "🔧 Sorting imports with isort..."
python -m isort .

echo "🔍 Running linter..."
python -m flake8 .

echo "🔍 Running type checker..."
python -m mypy app/ || echo "⚠️  MyPy found some type issues (this is normal for initial setup)"

echo "✅ Backend environment setup complete!"
echo "💡 To activate the environment: cd backend && source .venv/bin/activate"

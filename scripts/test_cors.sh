#!/bin/bash

# CORS Test Script for Windows
# This script tests the CORS configuration

echo "🧪 Testing Windows CORS Configuration"
echo "======================================"

# Start backend with explicit CORS settings
cd /Users/klm95441/Documents/asjad/BitCorp/bitcorp/backend

echo "Starting backend with Windows CORS settings..."
python -c "
import os
os.environ['ALLOWED_HOSTS'] = '*'
os.environ['CORS_ALLOW_CREDENTIALS'] = 'true'
os.environ['CORS_ALLOW_METHODS'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
os.environ['CORS_ALLOW_HEADERS'] = '*'

import uvicorn
from app.main import app

print('🚀 Starting backend with enhanced CORS...')
uvicorn.run(app, host='0.0.0.0', port=8000, log_level='info')
"

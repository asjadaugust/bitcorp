# Bitcorp ERP - Production Best Practices Guide 2025

## Executive Summary

This comprehensive guide provides actionable best practices for deploying, securing, monitoring, and scaling the Bitcorp ERP system in production environments. Based on extensive research of modern full-stack development practices, this document addresses the unique requirements of a civil construction equipment management system built with Next.js 15, FastAPI, and PostgreSQL.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Production-Ready Docker Configuration](#production-ready-docker-configuration)
3. [FastAPI Backend Best Practices](#fastapi-backend-best-practices)
4. [Next.js Frontend Production Guidelines](#nextjs-frontend-production-guidelines)
5. [Database Management & Security](#database-management--security)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Hardening](#security-hardening)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Scaling Strategies](#scaling-strategies)
10. [Deployment Checklist](#deployment-checklist)

---

## Architecture Overview

### Current Development Stack

- **Frontend**: Next.js 15.3.5 with TypeScript, Material-UI, SWR, Internationalization
- **Backend**: FastAPI with Python 3.11.5, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15+ with Redis for caching
- **Infrastructure**: Docker Compose for development, designed for Kubernetes production

### Production Architecture Recommendations

```mermaid
graph TB
    Internet[Internet]
    LB[Load Balancer/Nginx]
    CDN[CDN for Static Assets]
    
    subgraph "Frontend Tier"
        FE1[Next.js Instance 1]
        FE2[Next.js Instance 2]
        FE3[Next.js Instance 3]
    end
    
    subgraph "Backend Tier"
        API1[FastAPI Instance 1]
        API2[FastAPI Instance 2]
        API3[FastAPI Instance 3]
    end
    
    subgraph "Data Tier"
        PG[(PostgreSQL Primary)]
        PGR[(PostgreSQL Replica)]
        Redis[(Redis Cluster)]
    end
    
    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
        Logs[Centralized Logging]
    end
    
    Internet --> LB
    Internet --> CDN
    LB --> FE1
    LB --> FE2
    LB --> FE3
    FE1 --> API1
    FE2 --> API2
    FE3 --> API3
    API1 --> PG
    API2 --> PG
    API3 --> PG
    API1 --> PGR
    API2 --> PGR
    API3 --> PGR
    API1 --> Redis
    API2 --> Redis
    API3 --> Redis
```

---

## Production-Ready Docker Configuration

### 1. Multi-Stage Dockerfile for FastAPI Backend

```dockerfile
# Multi-stage build for optimized production image
FROM python:3.11-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV for fast dependency management
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Production stage
FROM python:3.11-slim as production

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create app directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Run with Gunicorn
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### 2. Next.js Production Dockerfile

```dockerfile
# Next.js Production Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
      - static_files:/var/www/static:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - web

  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NODE_ENV=production
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
    networks:
      - web

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=["https://yourdomain.com"]
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    networks:
      - web
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    restart: unless-stopped
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:
  static_files:

networks:
  web:
    driver: bridge
  backend:
    driver: bridge
```

---

## FastAPI Backend Best Practices

### 1. Production Configuration

```python
# config/production.py
import os
from pydantic_settings import BaseSettings

class ProductionSettings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: list[str] = ["https://yourdomain.com"]
    
    # Server
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    WORKERS: int = 4
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379")
    
    # Monitoring
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    class Config:
        env_file = ".env.production"

settings = ProductionSettings()
```

### 2. Gunicorn Configuration

```python
# gunicorn.conf.py
import multiprocessing
import os

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = int(os.getenv("WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# Timeout for graceful workers restart
timeout = 30
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "bitcorp-erp-api"

# Server mechanics
preload_app = True
daemon = False
pidfile = "/tmp/gunicorn.pid"
```

### 3. Enhanced Health Checks

```python
# app/health.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
import redis
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check"""
    return {"status": "healthy", "timestamp": time.time()}

@router.get("/health/detailed")
async def detailed_health_check(db: Session = Depends(get_db)):
    """Detailed health check with dependencies"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # Database check
    try:
        db.execute("SELECT 1")
        health_status["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"
    
    # Redis check
    try:
        r = redis.Redis.from_url(settings.REDIS_URL)
        r.ping()
        health_status["checks"]["redis"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"
    
    # System resources
    cpu_usage = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    health_status["checks"]["system"] = {
        "cpu_usage_percent": cpu_usage,
        "memory_usage_percent": memory.percent,
        "disk_usage_percent": (disk.used / disk.total) * 100,
        "status": "healthy" if cpu_usage < 90 and memory.percent < 90 else "warning"
    }
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status
```

---

## Next.js Frontend Production Guidelines

### 1. Performance Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Enable experimental features
  experimental: {
    // Enable app directory
    appDir: true,
    // Improve build performance
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Image optimization
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.yourdomain\.com\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
    ],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  
  // Bundle analyzer for production optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### 2. SWR Configuration for Production

```typescript
// lib/swr-config.ts
import { SWRConfig } from 'swr';
import { fetcher } from './swr-fetcher';

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 2000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        onError: (error) => {
          console.error('SWR Error:', error);
          // Log to monitoring service
          if (process.env.NODE_ENV === 'production') {
            // Send to error tracking service
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};
```

---

## Database Management & Security

### 1. PostgreSQL Production Configuration

```yaml
# postgresql.conf optimizations
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL settings for performance and backup
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB
min_wal_size = 80MB

# Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
```

### 2. Database Security Best Practices

```sql
-- Create application-specific user with limited privileges
CREATE USER bitcorp_app WITH PASSWORD 'secure_password_here';

-- Create database
CREATE DATABASE bitcorp_erp OWNER bitcorp_app;

-- Grant specific permissions only
GRANT CONNECT ON DATABASE bitcorp_erp TO bitcorp_app;
GRANT USAGE ON SCHEMA public TO bitcorp_app;
GRANT CREATE ON SCHEMA public TO bitcorp_app;

-- For production, use row-level security
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for data isolation
CREATE POLICY equipment_isolation ON equipment
  FOR ALL TO bitcorp_app
  USING (company_id = current_setting('app.current_company_id')::uuid);
```

### 3. Backup Strategy

```bash
#!/bin/bash
# backup-script.sh

# Environment variables
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="bitcorp_erp"
DB_USER="bitcorp_app"
BACKUP_DIR="/backups"
RETENTION_DAYS=30

# Create backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bitcorp_erp_$TIMESTAMP.sql"

# Perform backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
        --verbose --clean --no-owner --no-privileges \
        --format=custom > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to cloud storage (S3 example)
aws s3 cp $BACKUP_FILE.gz s3://bitcorp-backups/database/

# Clean old backups
find $BACKUP_DIR -name "bitcorp_erp_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

---

## Monitoring & Logging

### 1. Structured Logging Configuration

```python
# app/logging_config.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Configure structured logging for production"""
    
    # Create custom formatter
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s %(pathname)s %(lineno)d',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Set levels for third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    
    return root_logger
```

### 2. Prometheus Metrics

```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request, Response
import time

# Define metrics
REQUEST_COUNT = Counter(
    'bitcorp_requests_total', 
    'Total number of requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'bitcorp_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_EQUIPMENT = Gauge(
    'bitcorp_active_equipment_total',
    'Number of active equipment'
)

DAILY_REPORTS_SUBMITTED = Counter(
    'bitcorp_daily_reports_submitted_total',
    'Total number of daily reports submitted'
)

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status_code=response.status_code
    ).inc()
    
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 3. Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Bitcorp ERP Monitoring",
    "panels": [
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(bitcorp_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(bitcorp_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Active Equipment",
        "type": "singlestat",
        "targets": [
          {
            "expr": "bitcorp_active_equipment_total",
            "legendFormat": "Active Equipment"
          }
        ]
      },
      {
        "title": "Daily Reports Submission Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(bitcorp_daily_reports_submitted_total[1h])",
            "legendFormat": "Reports per hour"
          }
        ]
      }
    ]
  }
}
```

---

## Security Hardening

### 1. Nginx Security Configuration

```nginx
# nginx.conf
upstream fastapi_backend {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=30s;
    server backend2:8000 max_fails=3 fail_timeout=30s;
    server backend3:8000 max_fails=3 fail_timeout=30s;
}

upstream nextjs_frontend {
    least_conn;
    server frontend1:3000 max_fails=3 fail_timeout=30s;
    server frontend2:3000 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=frontend:10m rate=20r/s;

server {
    listen 80;
    server_name bitcorp.com www.bitcorp.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name bitcorp.com www.bitcorp.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/bitcorp.com.crt;
    ssl_certificate_key /etc/ssl/private/bitcorp.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend
    location / {
        limit_req zone=frontend burst=30 nodelay;
        
        proxy_pass http://nextjs_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Authentication endpoints with stricter rate limiting
    location ~ ^/api/(auth|login|register) {
        limit_req zone=auth burst=5 nodelay;
        
        proxy_pass http://fastapi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check (no rate limiting)
    location /health {
        proxy_pass http://fastapi_backend;
        access_log off;
    }
}
```

### 2. Environment Security

```bash
# .env.production (Template - DO NOT commit actual values)
# Database
DATABASE_URL=postgresql://user:CHANGE_ME@postgres:5432/bitcorp_erp
POSTGRES_DB=bitcorp_erp
POSTGRES_USER=bitcorp_app
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# Redis
REDIS_URL=redis://:CHANGE_ME_REDIS_PASSWORD@redis:6379
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

# Security
SECRET_KEY=CHANGE_ME_64_CHAR_SECRET_KEY_FOR_JWT_SIGNING
CORS_ORIGINS=["https://bitcorp.com","https://www.bitcorp.com"]

# Monitoring
SENTRY_DSN=https://your-sentry-dsn-here
GRAFANA_PASSWORD=CHANGE_ME_GRAFANA_PASSWORD

# Application
DEBUG=false
LOG_LEVEL=INFO
WORKERS=4
```

---

## CI/CD Pipeline

### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Bitcorp ERP

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: bitcorp-erp

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install Python dependencies
      run: |
        cd backend
        pip install uv
        uv sync

    - name: Install Node.js dependencies
      run: |
        cd frontend
        npm ci

    - name: Run backend tests
      run: |
        cd backend
        uv run pytest --cov=app --cov-report=xml

    - name: Run frontend tests
      run: |
        cd frontend
        npm run test

    - name: Run E2E tests
      run: |
        cd frontend
        npm run test:e2e

    - name: Security scan
      run: |
        cd backend
        uv run bandit -r app/
        uv run safety check

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [backend, frontend]
    steps:
    - uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.service }}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./${{ matrix.service }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/bitcorp-erp
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d --remove-orphans
          docker system prune -f
```

---

## Scaling Strategies

### 1. Horizontal Scaling Configuration

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bitcorp-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bitcorp-backend
  template:
    metadata:
      labels:
        app: bitcorp-backend
    spec:
      containers:
      - name: backend
        image: bitcorp-erp-backend:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: bitcorp-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: bitcorp-secrets
              key: redis-url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: bitcorp-backend-service
spec:
  selector:
    app: bitcorp-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### 2. Database Connection Pooling

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker

# Optimized connection pool for production
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Disable in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Redis Caching Strategy

```python
# app/cache.py
import redis
import json
from functools import wraps
from typing import Optional, Any

redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

def cache_result(expiration: int = 300, key_prefix: str = ""):
    """Decorator to cache function results in Redis"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            try:
                cached = redis_client.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception as e:
                # Log cache error but continue
                logger.warning(f"Cache read error: {e}")
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            try:
                redis_client.setex(cache_key, expiration, json.dumps(result, default=str))
            except Exception as e:
                # Log cache error but continue
                logger.warning(f"Cache write error: {e}")
            
            return result
        return wrapper
    return decorator

# Usage example
@cache_result(expiration=600, key_prefix="equipment")
async def get_equipment_list(filters: dict):
    # Database query here
    pass
```

---

## Deployment Checklist

### Pre-Deployment Checklist

#### Security

- [ ] All environment variables use strong, unique passwords
- [ ] SSL certificates are valid and properly configured
- [ ] CORS origins are restrictive and production-appropriate
- [ ] Database user has minimal required permissions
- [ ] Security headers are configured in Nginx
- [ ] Rate limiting is configured for all endpoints
- [ ] Secrets are not committed to version control

#### Performance

- [ ] Docker images are optimized with multi-stage builds
- [ ] Database connections are pooled appropriately
- [ ] Redis caching is configured for frequently accessed data
- [ ] Static assets are served through CDN
- [ ] Gzip compression is enabled
- [ ] Health checks are configured for all services

#### Monitoring

- [ ] Prometheus metrics are exposed
- [ ] Grafana dashboards are configured
- [ ] Log aggregation is set up
- [ ] Error tracking (Sentry) is configured
- [ ] Alert rules are defined for critical metrics
- [ ] Backup and recovery procedures are tested

#### Testing

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass in production-like environment
- [ ] Load testing has been performed
- [ ] Security scanning has been completed
- [ ] Dependency vulnerability scanning is clean

### Post-Deployment Checklist

#### Immediate (Within 1 hour)

- [ ] All services are healthy and responding
- [ ] Database connections are working
- [ ] Redis cache is functioning
- [ ] SSL certificates are working correctly
- [ ] Basic functionality testing (login, equipment listing, reports)
- [ ] Error rates are normal
- [ ] Response times are acceptable

#### Short-term (Within 24 hours)

- [ ] Monitor application logs for errors
- [ ] Verify backup procedures are working
- [ ] Check monitoring alerts are firing correctly
- [ ] Validate all API endpoints are functional
- [ ] Test mobile operator interface
- [ ] Verify internationalization is working
- [ ] Check performance metrics trends

#### Medium-term (Within 1 week)

- [ ] Performance optimization based on real traffic
- [ ] Scale resources based on actual usage
- [ ] Fine-tune monitoring thresholds
- [ ] Update documentation with production specifics
- [ ] Train operations team on new deployment
- [ ] Establish regular maintenance procedures

---

## Conclusion

This comprehensive guide provides the foundation for deploying Bitcorp ERP in a production environment that can scale with your civil construction operations. The recommendations focus on:

1. **Security**: Multi-layered security approach with proper authentication, authorization, and data protection
2. **Performance**: Optimized configurations for handling high-traffic scenarios typical in construction management
3. **Reliability**: Redundant systems, health checks, and automated recovery procedures
4. **Monitoring**: Comprehensive observability for proactive issue detection and resolution
5. **Scalability**: Architecture that can grow with your business needs

### Key Success Factors

- **Start Simple**: Begin with the basic production setup and add complexity as needed
- **Monitor Everything**: Implement comprehensive monitoring from day one
- **Automate Deployment**: Use CI/CD pipelines for consistent, reliable deployments
- **Regular Maintenance**: Schedule regular updates, backups, and security reviews
- **Document Changes**: Maintain detailed documentation of all configuration changes

### Next Steps

1. **Immediate**: Implement the basic production configuration
2. **Short-term**: Set up monitoring and alerting
3. **Medium-term**: Optimize performance based on real usage patterns
4. **Long-term**: Implement advanced features like auto-scaling and predictive analytics

This guide should serve as your roadmap for creating a robust, scalable, and secure production environment for the Bitcorp ERP system.

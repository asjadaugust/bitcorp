# Docker Setup and Containerization Guide

## Overview

This guide covers Docker containerization strategies for the Bitcorp ERP system, including development, staging, and production environments.

## Container Architecture

### Service Design Principles

Based on best practices from "Designing Data-Intensive Applications" by Martin Kleppmann:

1. **Single Responsibility**: Each container serves one purpose
2. **Stateless Design**: Application containers should be stateless
3. **Data Persistence**: Database containers use volumes for persistence
4. **Network Isolation**: Services communicate through defined networks

### Current Services

```yaml
services:
  # Application Services
  backend:          # FastAPI application
  frontend:         # Next.js application
  
  # Data Services
  db:              # PostgreSQL database
  redis:           # Redis cache/session store
  
  # Management Services
  pgadmin:         # Database administration
```

## Development Environment

### docker-compose.yml Structure

```yaml
version: '3.8'

networks:
  bitcorp-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: bitcorp_erp
      POSTGRES_USER: bitcorp_user
      POSTGRES_PASSWORD: bitcorp_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - bitcorp-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - bitcorp-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - DATABASE_URL=postgresql://bitcorp_user:bitcorp_pass@db:5432/bitcorp_erp
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    networks:
      - bitcorp-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - bitcorp-network
    restart: unless-stopped
```

## Production Environment

### Multi-Stage Dockerfiles

#### Backend Dockerfile

```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Container Security

### Security Best Practices

From "Clean Code" principles applied to containerization:

1. **Minimal Base Images**: Use Alpine or slim variants
2. **Non-Root Users**: Run containers as non-root users
3. **Dependency Scanning**: Regularly scan for vulnerabilities
4. **Secrets Management**: Use Docker secrets or external secret managers

### Security Configuration

```yaml
# Production security settings
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "1001:1001"
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

## Volume Management

### Data Persistence Strategy

```yaml
volumes:
  # Database data
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/docker/volumes/bitcorp_postgres

  # Redis data
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/docker/volumes/bitcorp_redis

  # Application uploads
  uploads_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/docker/volumes/bitcorp_uploads
```

## Network Configuration

### Service Communication

```yaml
networks:
  # Public network for external access
  public:
    driver: bridge
    
  # Private network for internal services
  private:
    driver: bridge
    internal: true
    
  # Database network
  database:
    driver: bridge
    internal: true
```

## Health Checks

### Application Health Monitoring

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bitcorp_user -d bitcorp_erp"]
      interval: 30s
      timeout: 5s
      retries: 5
```

## Environment Configuration

### Configuration Management

```bash
# Development
cp .env.example .env.development

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=0

# Redis
REDIS_URL=redis://host:port
REDIS_POOL_SIZE=10

# Application
DEBUG=false
LOG_LEVEL=INFO
SECRET_KEY=your-secret-key

# Security
CORS_ORIGINS=https://yourdomain.com
TRUSTED_HOSTS=yourdomain.com

# External Services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
```

## Monitoring and Logging

### Centralized Logging

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=backend"

  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=frontend"
```

## Backup and Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker exec postgres_container pg_dump \
  -U bitcorp_user \
  -d bitcorp_erp \
  --no-owner \
  --no-privileges \
  > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
```

## Deployment Commands

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build
```

### Production

```bash
# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Update specific service
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps backend

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Check for conflicting port usage
2. **Volume Permissions**: Ensure correct file permissions
3. **Network Issues**: Verify network connectivity between services
4. **Resource Limits**: Monitor CPU and memory usage

### Debugging Commands

```bash
# Check container status
docker-compose ps

# Inspect container logs
docker-compose logs service_name

# Execute commands in container
docker-compose exec service_name bash

# Check resource usage
docker stats

# Inspect networks
docker network ls
docker network inspect network_name
```

## Performance Optimization

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Build Optimization

1. **Layer Caching**: Optimize Dockerfile layer order
2. **Multi-stage Builds**: Reduce final image size
3. **Dependency Caching**: Cache npm/pip dependencies
4. **Build Context**: Use .dockerignore to exclude files

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker build -t bitcorp/backend:latest ./backend
          docker build -t bitcorp/frontend:latest ./frontend
          
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

This Docker setup provides a robust, scalable, and maintainable containerization strategy for the Bitcorp ERP system, following industry best practices for security, performance, and reliability.

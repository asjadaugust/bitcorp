# CI/CD Pipeline Implementation Guide

## Overview

This guide outlines the complete Continuous Integration and Continuous Deployment pipeline for Bitcorp ERP, implementing industry best practices for automated testing, building, and deployment across multiple environments.

## Pipeline Architecture

### CI/CD Philosophy

Based on "Continuous Delivery" best practices and DevOps principles:

1. **Fail Fast**: Detect issues early in the development cycle
2. **Automated Quality Gates**: Ensure code quality through automated checks
3. **Infrastructure as Code**: Manage infrastructure through version control
4. **Immutable Deployments**: Deploy immutable artifacts across environments
5. **Rollback Capability**: Quick rollback mechanisms for failed deployments
6. **Security Integration**: Security scanning throughout the pipeline
7. **Observability**: Comprehensive monitoring and logging

### Pipeline Stages

```mermaid
graph LR
    A[Code Commit] --> B[Lint & Format]
    B --> C[Unit Tests]
    C --> D[Build]
    D --> E[Integration Tests]
    E --> F[Security Scan]
    F --> G[Build Images]
    G --> H[Deploy to Staging]
    H --> I[E2E Tests]
    I --> J[Performance Tests]
    J --> K[Deploy to Production]
    K --> L[Health Checks]
    L --> M[Monitoring]
```

## GitHub Actions Workflows

### Main CI/CD Workflow

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ==========================================
  # CODE QUALITY AND LINTING
  # ==========================================
  lint-and-format:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      # Backend linting
      - name: Install Python dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install black isort flake8 mypy
      
      - name: Run Black formatter
        run: |
          cd backend
          black --check --diff .
      
      - name: Run isort
        run: |
          cd backend
          isort --check-only --diff .
      
      - name: Run Flake8
        run: |
          cd backend
          flake8 app/ tests/
      
      - name: Run MyPy type checking
        run: |
          cd backend
          mypy app/
      
      # Frontend linting
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run ESLint
        run: |
          cd frontend
          npm run lint
      
      - name: Run Prettier check
        run: |
          cd frontend
          npm run prettier:check
      
      - name: Run TypeScript compilation
        run: |
          cd frontend
          npm run type-check

  # ==========================================
  # UNIT TESTS
  # ==========================================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-format
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Backend tests
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Cache Python dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements.txt') }}
      
      - name: Install backend dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run backend unit tests
        run: |
          cd backend
          pytest tests/unit/ -v --cov=app --cov-report=xml --cov-report=html
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
          SECRET_KEY: test-secret-key
      
      # Frontend tests
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run frontend unit tests
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Upload backend coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
          flags: backend
          name: backend-coverage
      
      - name: Upload frontend coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend
          name: frontend-coverage

  # ==========================================
  # BUILD APPLICATIONS
  # ==========================================
  build:
    name: Build Applications
    runs-on: ubuntu-latest
    needs: unit-tests
    
    outputs:
      backend-image: ${{ steps.backend-meta.outputs.tags }}
      frontend-image: ${{ steps.frontend-meta.outputs.tags }}
      version: ${{ steps.version.outputs.version }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Generate version
        id: version
        run: |
          if [[ $GITHUB_REF == refs/tags/* ]]; then
            VERSION=${GITHUB_REF#refs/tags/}
          else
            VERSION=$(git describe --tags --always --dirty)-${GITHUB_SHA::8}
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      # Backend build
      - name: Extract backend metadata
        id: backend-meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/backend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}
            type=raw,value=${{ steps.version.outputs.version }}
      
      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.backend-meta.outputs.tags }}
          labels: ${{ steps.backend-meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ steps.version.outputs.version }}
            BUILD_DATE=${{ fromJSON(steps.backend-meta.outputs.json).labels['org.opencontainers.image.created'] }}
      
      # Frontend build
      - name: Extract frontend metadata
        id: frontend-meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}
            type=raw,value=${{ steps.version.outputs.version }}
      
      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.frontend-meta.outputs.tags }}
          labels: ${{ steps.frontend-meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ steps.version.outputs.version }}
            BUILD_DATE=${{ fromJSON(steps.frontend-meta.outputs.json).labels['org.opencontainers.image.created'] }}

  # ==========================================
  # SECURITY SCANNING
  # ==========================================
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner (Backend)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.backend-image }}
          format: 'sarif'
          output: 'trivy-backend-results.sarif'
      
      - name: Run Trivy vulnerability scanner (Frontend)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.frontend-image }}
          format: 'sarif'
          output: 'trivy-frontend-results.sarif'
      
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-backend-results.sarif'
      
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-frontend-results.sarif'
      
      # SAST scanning
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: python, javascript
      
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  # ==========================================
  # INTEGRATION TESTS
  # ==========================================
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [build, security-scan]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Compose
        run: |
          # Create test environment
          cp docker-compose.test.yml docker-compose.override.yml
          
          # Use built images
          sed -i "s|bitcorp/backend:latest|${{ needs.build.outputs.backend-image }}|g" docker-compose.override.yml
          sed -i "s|bitcorp/frontend:latest|${{ needs.build.outputs.frontend-image }}|g" docker-compose.override.yml
      
      - name: Start test environment
        run: |
          docker-compose up -d
          
          # Wait for services to be ready
          timeout 300 bash -c 'until docker-compose exec -T backend curl -f http://localhost:8000/health; do sleep 5; done'
          timeout 300 bash -c 'until docker-compose exec -T frontend curl -f http://localhost:3000; do sleep 5; done'
      
      - name: Run integration tests
        run: |
          docker-compose exec -T backend pytest tests/integration/ -v
      
      - name: Collect logs
        if: failure()
        run: |
          docker-compose logs > logs.txt
      
      - name: Upload logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-logs
          path: logs.txt
      
      - name: Clean up
        if: always()
        run: docker-compose down -v

  # ==========================================
  # DEPLOY TO STAGING
  # ==========================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, integration-tests]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Deploy to ECS
        run: |
          # Update ECS task definition
          aws ecs update-service \
            --cluster bitcorp-staging \
            --service bitcorp-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster bitcorp-staging \
            --service bitcorp-frontend \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster bitcorp-staging \
            --services bitcorp-backend bitcorp-frontend
      
      - name: Run health checks
        run: |
          # Health check staging environment
          curl -f https://staging-api.bitcorp.com/health
          curl -f https://staging.bitcorp.com

  # ==========================================
  # END-TO-END TESTS
  # ==========================================
  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Playwright
        run: |
          npm install -g @playwright/test
          playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd tests/e2e
          playwright test --config=playwright.staging.config.ts
        env:
          BASE_URL: https://staging.bitcorp.com
          API_URL: https://staging-api.bitcorp.com
      
      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-results
          path: tests/e2e/test-results/

  # ==========================================
  # PERFORMANCE TESTS
  # ==========================================
  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install locust
      
      - name: Run performance tests
        run: |
          cd tests/performance
          locust -f locustfile.py \
            --headless \
            --users 100 \
            --spawn-rate 10 \
            --run-time 300s \
            --host https://staging-api.bitcorp.com \
            --html performance-report.html
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: tests/performance/performance-report.html

  # ==========================================
  # DEPLOY TO PRODUCTION
  # ==========================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [e2e-tests, performance-tests]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Blue-Green deployment
        run: |
          # Implement blue-green deployment strategy
          ./scripts/deploy-production.sh \
            --backend-image "${{ needs.build.outputs.backend-image }}" \
            --frontend-image "${{ needs.build.outputs.frontend-image }}" \
            --version "${{ needs.build.outputs.version }}"
      
      - name: Run production health checks
        run: |
          # Comprehensive health checks
          ./scripts/health-check.sh --environment production
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: |
            Deployment to production ${{ job.status }}
            Version: ${{ needs.build.outputs.version }}
            Commit: ${{ github.sha }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Deployment Scripts

### Blue-Green Deployment Script

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="bitcorp-production"
BACKEND_SERVICE="bitcorp-backend"
FRONTEND_SERVICE="bitcorp-frontend"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_DELAY=10

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-image)
      BACKEND_IMAGE="$2"
      shift 2
      ;;
    --frontend-image)
      FRONTEND_IMAGE="$2"
      shift 2
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}Starting Blue-Green Deployment${NC}"
echo "Backend Image: $BACKEND_IMAGE"
echo "Frontend Image: $FRONTEND_IMAGE"
echo "Version: $VERSION"

# Function to check service health
check_service_health() {
  local service_url=$1
  local retries=$2
  
  for i in $(seq 1 $retries); do
    if curl -f -s "$service_url/health" > /dev/null; then
      echo -e "${GREEN}✓ Service is healthy${NC}"
      return 0
    fi
    
    echo -e "${YELLOW}Waiting for service to be healthy... ($i/$retries)${NC}"
    sleep $HEALTH_CHECK_DELAY
  done
  
  echo -e "${RED}✗ Service health check failed${NC}"
  return 1
}

# Function to deploy service
deploy_service() {
  local service_name=$1
  local image=$2
  
  echo -e "${YELLOW}Deploying $service_name...${NC}"
  
  # Create new task definition
  TASK_DEFINITION=$(aws ecs describe-task-definition \
    --task-definition "$service_name" \
    --query 'taskDefinition' \
    --output json)
  
  # Update image in task definition
  NEW_TASK_DEFINITION=$(echo $TASK_DEFINITION | \
    jq --arg IMAGE "$image" \
    '.containerDefinitions[0].image = $IMAGE' | \
    jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')
  
  # Register new task definition
  NEW_TASK_ARN=$(echo $NEW_TASK_DEFINITION | \
    aws ecs register-task-definition \
    --cli-input-json file:///dev/stdin \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)
  
  echo "New task definition: $NEW_TASK_ARN"
  
  # Update service
  aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$service_name" \
    --task-definition "$NEW_TASK_ARN" \
    --desired-count 2 > /dev/null
  
  echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
  aws ecs wait services-stable \
    --cluster "$CLUSTER_NAME" \
    --services "$service_name"
  
  echo -e "${GREEN}✓ $service_name deployed successfully${NC}"
}

# Function to rollback service
rollback_service() {
  local service_name=$1
  
  echo -e "${RED}Rolling back $service_name...${NC}"
  
  # Get previous task definition
  PREVIOUS_TASK_ARN=$(aws ecs describe-services \
    --cluster "$CLUSTER_NAME" \
    --services "$service_name" \
    --query 'services[0].deployments[?status==`PRIMARY`].taskDefinition' \
    --output text)
  
  # Get the previous revision
  CURRENT_REVISION=$(echo $PREVIOUS_TASK_ARN | grep -o ':.*' | cut -d: -f2)
  PREVIOUS_REVISION=$((CURRENT_REVISION - 1))
  ROLLBACK_TASK_ARN=$(echo $PREVIOUS_TASK_ARN | sed "s/:$CURRENT_REVISION/:$PREVIOUS_REVISION/")
  
  # Update service to previous task definition
  aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$service_name" \
    --task-definition "$ROLLBACK_TASK_ARN" > /dev/null
  
  aws ecs wait services-stable \
    --cluster "$CLUSTER_NAME" \
    --services "$service_name"
  
  echo -e "${GREEN}✓ $service_name rolled back successfully${NC}"
}

# Deploy backend service
deploy_service "$BACKEND_SERVICE" "$BACKEND_IMAGE"

# Health check backend
if ! check_service_health "https://api.bitcorp.com" $HEALTH_CHECK_RETRIES; then
  echo -e "${RED}Backend health check failed, rolling back...${NC}"
  rollback_service "$BACKEND_SERVICE"
  exit 1
fi

# Deploy frontend service
deploy_service "$FRONTEND_SERVICE" "$FRONTEND_IMAGE"

# Health check frontend
if ! check_service_health "https://bitcorp.com" $HEALTH_CHECK_RETRIES; then
  echo -e "${RED}Frontend health check failed, rolling back...${NC}"
  rollback_service "$FRONTEND_SERVICE"
  rollback_service "$BACKEND_SERVICE"
  exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "Version $VERSION is now live in production"

# Tag deployment in monitoring
curl -X POST "https://api.datadog.com/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: $DATADOG_API_KEY" \
  -d '{
    "title": "Production Deployment",
    "text": "Version '"$VERSION"' deployed to production",
    "tags": ["deployment", "production", "version:'"$VERSION"'"]
  }'
```

### Health Check Script

```bash
#!/bin/bash
# scripts/health-check.sh

set -e

# Configuration
ENVIRONMENTS=("staging" "production")
ENDPOINTS=(
  "https://api.bitcorp.com/health"
  "https://api.bitcorp.com/api/v1/health"
  "https://bitcorp.com"
)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse arguments
ENVIRONMENT=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Usage: $0 --environment <staging|production>"
  exit 1
fi

# Set environment-specific URLs
if [[ "$ENVIRONMENT" == "staging" ]]; then
  ENDPOINTS=(
    "https://staging-api.bitcorp.com/health"
    "https://staging-api.bitcorp.com/api/v1/health"
    "https://staging.bitcorp.com"
  )
fi

echo -e "${YELLOW}Running health checks for $ENVIRONMENT environment...${NC}"

# Function to check endpoint
check_endpoint() {
  local url=$1
  local max_retries=5
  local retry_delay=2
  
  for i in $(seq 1 $max_retries); do
    if curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ $url${NC}"
      return 0
    fi
    
    if [[ $i -lt $max_retries ]]; then
      echo -e "${YELLOW}Retrying $url ($i/$max_retries)...${NC}"
      sleep $retry_delay
    fi
  done
  
  echo -e "${RED}✗ $url${NC}"
  return 1
}

# Function to check database connectivity
check_database() {
  local db_url="$1"
  
  if [[ "$ENVIRONMENT" == "staging" ]]; then
    db_url="https://staging-api.bitcorp.com/api/v1/health/database"
  else
    db_url="https://api.bitcorp.com/api/v1/health/database"
  fi
  
  if curl -f -s --max-time 5 "$db_url" | jq -e '.database.status == "healthy"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connectivity${NC}"
    return 0
  else
    echo -e "${RED}✗ Database connectivity${NC}"
    return 1
  fi
}

# Function to check Redis connectivity
check_redis() {
  local redis_url="$1"
  
  if [[ "$ENVIRONMENT" == "staging" ]]; then
    redis_url="https://staging-api.bitcorp.com/api/v1/health/redis"
  else
    redis_url="https://api.bitcorp.com/api/v1/health/redis"
  fi
  
  if curl -f -s --max-time 5 "$redis_url" | jq -e '.redis.status == "healthy"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis connectivity${NC}"
    return 0
  else
    echo -e "${RED}✗ Redis connectivity${NC}"
    return 1
  fi
}

# Function to check performance metrics
check_performance() {
  local api_url="$1"
  
  if [[ "$ENVIRONMENT" == "staging" ]]; then
    api_url="https://staging-api.bitcorp.com/api/v1/equipment?page=1&per_page=10"
  else
    api_url="https://api.bitcorp.com/api/v1/equipment?page=1&per_page=10"
  fi
  
  local response_time=$(curl -w "%{time_total}" -s -o /dev/null "$api_url" || echo "999")
  local response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
  
  if [[ $response_time_ms -lt 500 ]]; then
    echo -e "${GREEN}✓ API response time: ${response_time_ms}ms${NC}"
    return 0
  else
    echo -e "${RED}✗ API response time: ${response_time_ms}ms (too slow)${NC}"
    return 1
  fi
}

# Run health checks
failed_checks=0

echo "Checking endpoints..."
for endpoint in "${ENDPOINTS[@]}"; do
  if ! check_endpoint "$endpoint"; then
    ((failed_checks++))
  fi
done

echo "Checking database connectivity..."
if ! check_database; then
  ((failed_checks++))
fi

echo "Checking Redis connectivity..."
if ! check_redis; then
  ((failed_checks++))
fi

echo "Checking performance..."
if ! check_performance; then
  ((failed_checks++))
fi

# Summary
echo ""
if [[ $failed_checks -eq 0 ]]; then
  echo -e "${GREEN}🎉 All health checks passed for $ENVIRONMENT environment${NC}"
  exit 0
else
  echo -e "${RED}❌ $failed_checks health check(s) failed for $ENVIRONMENT environment${NC}"
  exit 1
fi
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "./modules/vpc"
  
  name = "${var.project_name}-${var.environment}"
  cidr = var.vpc_cidr
  
  availability_zones = var.availability_zones
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = local.common_tags
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  cluster_name = "${var.project_name}-${var.environment}"
  
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnets
  public_subnet_ids  = module.vpc.public_subnets
  
  # Backend service
  backend_image       = var.backend_image
  backend_cpu         = var.backend_cpu
  backend_memory      = var.backend_memory
  backend_desired_count = var.backend_desired_count
  
  # Frontend service
  frontend_image       = var.frontend_image
  frontend_cpu         = var.frontend_cpu
  frontend_memory      = var.frontend_memory
  frontend_desired_count = var.frontend_desired_count
  
  # Database
  database_url = module.rds.connection_string
  redis_url    = module.redis.connection_string
  
  tags = local.common_tags
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  identifier = "${var.project_name}-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  allocated_storage = var.db_allocated_storage
  storage_encrypted = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [module.security_groups.database_sg_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  
  backup_retention_period = var.environment == "production" ? 7 : 3
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  tags = local.common_tags
}

# Redis Cache
module "redis" {
  source = "./modules/redis"
  
  cluster_id = "${var.project_name}-${var.environment}"
  
  node_type          = var.redis_node_type
  num_cache_nodes    = var.redis_num_nodes
  parameter_group    = "default.redis7"
  port              = 6379
  
  subnet_group_name       = module.vpc.elasticache_subnet_group
  security_group_ids      = [module.security_groups.redis_sg_id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  name = "${var.project_name}-${var.environment}"
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.public_subnets
  security_groups = [module.security_groups.alb_sg_id]
  
  certificate_arn = var.ssl_certificate_arn
  domain_name     = var.domain_name
  
  backend_target_group_arn  = module.ecs.backend_target_group_arn
  frontend_target_group_arn = module.ecs.frontend_target_group_arn
  
  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "./modules/security_groups"
  
  name   = "${var.project_name}-${var.environment}"
  vpc_id = module.vpc.vpc_id
  
  tags = local.common_tags
}

# CloudWatch Monitoring
module "monitoring" {
  source = "./modules/monitoring"
  
  environment = var.environment
  
  ecs_cluster_name    = module.ecs.cluster_name
  backend_service_name = module.ecs.backend_service_name
  frontend_service_name = module.ecs.frontend_service_name
  
  rds_instance_id = module.rds.instance_id
  redis_cluster_id = module.redis.cluster_id
  
  alb_arn_suffix = module.alb.arn_suffix
  
  tags = local.common_tags
}

# Local values
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

### Environment-Specific Variables

```hcl
# infrastructure/environments/production/terraform.tfvars

project_name = "bitcorp-erp"
environment  = "production"
aws_region   = "us-west-2"

# Network
vpc_cidr            = "10.0.0.0/16"
availability_zones  = ["us-west-2a", "us-west-2b", "us-west-2c"]
public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnets    = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]

# ECS Configuration
backend_image         = "ghcr.io/bitcorp/backend:latest"
backend_cpu          = 1024
backend_memory       = 2048
backend_desired_count = 3

frontend_image         = "ghcr.io/bitcorp/frontend:latest"
frontend_cpu          = 512
frontend_memory       = 1024
frontend_desired_count = 2

# Database
db_instance_class    = "db.r6g.large"
db_allocated_storage = 100
db_name              = "bitcorp_erp"
db_username          = "bitcorp_user"

# Redis
redis_node_type  = "cache.r6g.large"
redis_num_nodes  = 3

# SSL and Domain
ssl_certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"
domain_name        = "bitcorp.com"
```

## Monitoring and Alerting

### CloudWatch Dashboards

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", "ServiceName", "bitcorp-backend"],
          [".", "MemoryUtilization", ".", "."],
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "bitcorp-production"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-west-2",
        "title": "Application Performance"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "bitcorp-production"],
          [".", "DatabaseConnections", ".", "."],
          [".", "ReadLatency", ".", "."],
          [".", "WriteLatency", ".", "."]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-west-2",
        "title": "Database Performance"
      }
    }
  ]
}
```

### Alerting Configuration

```yaml
# monitoring/alerts.yml

alerts:
  - name: High CPU Usage
    metric: AWS/ECS/CPUUtilization
    threshold: 80
    comparison: GreaterThanThreshold
    evaluation_periods: 2
    period: 300
    actions:
      - arn:aws:sns:us-west-2:123456789012:critical-alerts
  
  - name: High Memory Usage
    metric: AWS/ECS/MemoryUtilization
    threshold: 85
    comparison: GreaterThanThreshold
    evaluation_periods: 2
    period: 300
    actions:
      - arn:aws:sns:us-west-2:123456789012:critical-alerts
  
  - name: High Response Time
    metric: AWS/ApplicationELB/TargetResponseTime
    threshold: 2.0
    comparison: GreaterThanThreshold
    evaluation_periods: 3
    period: 300
    actions:
      - arn:aws:sns:us-west-2:123456789012:performance-alerts
  
  - name: Database Connection Count
    metric: AWS/RDS/DatabaseConnections
    threshold: 80
    comparison: GreaterThanThreshold
    evaluation_periods: 2
    period: 300
    actions:
      - arn:aws:sns:us-west-2:123456789012:database-alerts
```

This comprehensive CI/CD pipeline ensures reliable, secure, and automated deployment of the Bitcorp ERP system with proper testing, monitoring, and rollback capabilities.

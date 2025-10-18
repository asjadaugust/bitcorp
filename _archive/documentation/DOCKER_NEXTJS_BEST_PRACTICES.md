# Docker Next.js Best Practices & Future Recommendations

Based on comprehensive research and our implementation experience, here are the essential best practices for stable Docker + Next.js deployments.

## 1. Port Stability Best Practices

### ✅ Implemented Solutions
- **Explicit PORT Environment Variable**: Set `PORT=3000` in docker-compose.yml
- **Next.js Configuration Enforcement**: Use `env.PORT = '3000'` in next.config.ts
- **Dockerfile Port Declaration**: Include `ENV PORT=3000` in Dockerfile
- **Container Command Explicit Binding**: Use `-p 3000:3000` in Docker run commands

### 🔄 Industry Standard Approach
According to Next.js official documentation and community best practices:

```dockerfile
# Multi-stage build with explicit port configuration
FROM node:18-alpine AS base
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE $PORT
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

## 2. Production Deployment Patterns

### Docker Compose Configuration
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      args:
        - PORT=3000
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

### Next.js Standalone Output
Essential for Docker optimization:

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  env: {
    PORT: '3000'
  }
}
```

## 3. Environment Variable Management

### 🚨 Critical Distinction
- **Build-time variables**: `NEXT_PUBLIC_*` (embedded in client bundle)
- **Runtime variables**: Server-side only, passed via container environment

### Best Practice Implementation
```dockerfile
# Build stage - only public variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Runtime stage - private variables via docker run
# docker run -e DATABASE_URL=secret -e API_KEY=secret
```

## 4. Security Best Practices

### Container Security
```dockerfile
# Use non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Minimal file permissions
COPY --chown=nextjs:nodejs /app/.next ./.next
```

### Signal Handling
```dockerfile
# Direct node execution for proper SIGTERM handling
CMD ["node", "server.js"]
# NOT: CMD ["npm", "start"] - breaks graceful shutdown
```

## 5. Performance Optimizations

### Multi-stage Build Benefits
- **Smaller final image**: Only production dependencies
- **Faster builds**: Cached dependency layers
- **Security**: No build tools in production image

### Caching Strategy
```dockerfile
# Copy package files first for better cache hits
COPY package.json package-lock.json ./
RUN npm ci --only=production
# Then copy source code
COPY . .
```

## 6. Development vs Production

### Development Mode
```dockerfile
FROM node:18-alpine AS development
WORKDIR /app
ENV NODE_ENV=development
ENV PORT=3000
CMD ["npm", "run", "dev"]
```

### Production Targeting
```bash
# Build for specific target
docker build --target production -t myapp:prod .
docker build --target development -t myapp:dev .
```

## 7. Common Pitfalls to Avoid

### ❌ Anti-patterns
1. **Using npm/yarn start in CMD**: Breaks signal handling
2. **Running as root user**: Security vulnerability
3. **Including node_modules in COPY**: Overrides npm install
4. **No .dockerignore**: Copies unnecessary files
5. **Build-time networking**: Complicates multi-environment deployment

### ✅ Correct Approaches
1. **Direct node execution**: `CMD ["node", "server.js"]`
2. **Dedicated user**: Create and use nodejs/nextjs user
3. **Selective copying**: Copy package.json first, then source
4. **Comprehensive .dockerignore**: Exclude dev files
5. **Runtime environment configuration**: Use docker run -e

## 8. Testing and Validation

### Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Automated Testing
```bash
# Port stability test
curl -f http://localhost:3000 || exit 1
# API health test  
curl -f http://localhost:8000/api/v1/health || exit 1
```

## 9. Monitoring and Observability

### Container Metrics
- Port accessibility monitoring
- Memory usage tracking
- CPU utilization alerts
- Container restart detection

### Application Metrics
- Response time monitoring
- Error rate tracking
- Build time optimization
- Cache hit rates

## 10. Future Recommendations

### Short-term Improvements
1. **Implement health endpoints** for better monitoring
2. **Add automated port stability tests** to CI/CD
3. **Configure log aggregation** for debugging
4. **Set up container registry** for image management

### Long-term Considerations
1. **Kubernetes deployment** for better orchestration
2. **Helm charts** for environment management
3. **Service mesh** for advanced networking
4. **Distributed tracing** for performance analysis

### Advanced Patterns
1. **Init containers** for pre-startup tasks
2. **Sidecar containers** for logging/monitoring
3. **ConfigMaps/Secrets** for environment management
4. **Horizontal Pod Autoscaling** for load management

## 11. Troubleshooting Guide

### Port Issues
```bash
# Check port usage
lsof -i :3000
netstat -tlnp | grep :3000

# Verify container binding
docker ps
docker port <container_name>
```

### Common Solutions
- **Port already in use**: Change host port mapping
- **Container not accessible**: Check firewall rules
- **Build failures**: Verify .dockerignore and dependencies
- **Performance issues**: Optimize Dockerfile layers

## 12. Implementation Checklist

### ✅ Essential Requirements
- [ ] Explicit PORT environment variables
- [ ] Multi-stage Dockerfile with security user
- [ ] Comprehensive .dockerignore file
- [ ] Health check endpoints
- [ ] Proper signal handling
- [ ] Environment-specific configuration
- [ ] Automated testing for port stability
- [ ] Container monitoring setup

### 📈 Performance Optimizations  
- [ ] Docker layer caching optimization
- [ ] Standalone build configuration
- [ ] Resource limit settings
- [ ] Build time minimization
- [ ] Image size optimization

### 🔒 Security Measures
- [ ] Non-root user execution
- [ ] Secret management strategy
- [ ] Network security configuration
- [ ] Regular security updates
- [ ] Vulnerability scanning

This guide represents current industry best practices as of 2024 and should be reviewed regularly as Docker and Next.js ecosystems evolve.

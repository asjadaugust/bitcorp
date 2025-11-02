# ==============================================================================
# Multi-stage build for production deployment
# ==============================================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
# gcompat replaces libc6-compat in Alpine 3.19+
RUN apk add --no-cache gcompat

WORKDIR /app

# Copy package files only (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies - use npm install if lock file doesn't exist
RUN if [ -f package-lock.json ]; then \
    npm ci --omit=dev --ignore-scripts; \
    else \
    npm install --omit=dev --ignore-scripts; \
    fi && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Accept build-time arguments
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_APP_NAME="Bitcorp ERP"

# Set build-time environment
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NODE_ENV=production

# Build Next.js app
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if(r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start Next.js in production mode
CMD ["node", "server.js"]

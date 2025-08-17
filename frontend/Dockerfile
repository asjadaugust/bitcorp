# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set PORT environment variable to ensure consistent port usage
ENV PORT=3000

# Install dependencies based on the preferred package manager
COPY package.json ./
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Skip build for development - use runtime build
# RUN npm run build

# Expose port 3000 explicitly
EXPOSE 3000

# Start the development server with explicit port
CMD ["npm", "run", "dev", "--", "-p", "3000"]

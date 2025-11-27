FROM node:22.12.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install glibc for better compatibility with npm packages
RUN apk add --no-cache gcompat

# Copy package files
COPY package*.json ./

# Clean install with force to handle optional dependencies
RUN npm ci --force --include=dev && \
    npm cache clean --force

# Development stage
FROM base AS dev
WORKDIR /app

# Install glibc for runtime compatibility
RUN apk add --no-cache gcompat

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

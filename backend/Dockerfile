# Simple single-stage build for backend
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Change ownership to non-root user
RUN chown -R backend:nodejs /app
USER backend

# Expose port
EXPOSE 5000

# Start production server
CMD ["npm", "run", "start"]

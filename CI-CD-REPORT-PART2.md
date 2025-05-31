# 🚀 **CI/CD Report - Part 2**
## **Implementation Details & Advanced Sections**

---

## **6. Implementation Details**

### **6.1 GitHub Actions Workflow Implementation**

#### **Main CI/CD Pipeline (.github/workflows/ci.yml)**
```yaml
name: 'Main CI/CD Pipeline'

on:
  push:
    branches: [ main, develop, 'feature/*' ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: false
        default: 'staging'
        type: choice
        options: ['staging', 'production']
      skip_tests:
        description: 'Skip tests'
        required: false
        default: false
        type: boolean

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME_FRONTEND: seminar-hall-frontend
  IMAGE_NAME_BACKEND: seminar-hall-backend

jobs:
  # Job 1: Code Quality & Security (3-5 min)
  code-quality:
    runs-on: ubuntu-latest
    name: Code Quality & Security
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd backend && npm ci
    
    - name: Run ESLint
      run: npm run lint
    
    - name: Check code formatting (Prettier)
      run: npm run format:check
    
    - name: TypeScript check
      run: |
        npm run type-check
        cd backend && npm run type-check
    
    - name: Security audit
      run: |
        npm audit --audit-level=high
        cd backend && npm audit --audit-level=high
```

#### **Testing Implementation Details**

##### **Unit Testing Configuration (Jest)**
```javascript
// jest.config.js (Frontend)
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.config.js (Backend)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/app.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
}
```

##### **E2E Testing Implementation (Cypress)**
```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:5000',
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123'
      }
    },
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
  },
})
```

##### **Performance Testing Implementation (Artillery)**
```yaml
# .github/artillery/api-load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 30
      arrivalRate: 1
      name: "Warm-up"
    - duration: 60
      arrivalRate: 1
      rampTo: 10
      name: "Ramp-up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 10
      rampTo: 25
      name: "Peak load"

scenarios:
  - name: "Health Check"
    weight: 10
    flow:
      - get:
          url: "/health"
          expect:
            - statusCode: 200

  - name: "Get Halls"
    weight: 30
    flow:
      - get:
          url: "/api/halls"
          expect:
            - statusCode: 200
            - hasProperty: "data"
```

### **6.2 Docker Implementation**

#### **Frontend Dockerfile**
```dockerfile
# Multi-stage build for Next.js
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **Backend Dockerfile**
```dockerfile
# Multi-stage build for Express.js
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 5000
USER node
CMD ["npm", "start"]
```

#### **Docker Compose Configuration**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      target: development
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

### **6.3 Security Implementation**

#### **SAST Integration**
```yaml
# Advanced Security Job
advanced-security:
  runs-on: ubuntu-latest
  name: Advanced Security Analysis
  permissions:
    actions: read
    contents: read
    security-events: write

  steps:
  - name: Initialize CodeQL
    uses: github/codeql-action/init@v3
    with:
      languages: javascript, typescript

  - name: Perform CodeQL Analysis
    uses: github/codeql-action/analyze@v3

  - name: Run Semgrep SAST
    uses: semgrep/semgrep-action@v1
    with:
      config: >-
        p/security-audit
        p/secrets
        p/owasp-top-ten
        p/javascript
        p/typescript
        p/react
        p/nodejs

  - name: Run Snyk security scan
    uses: snyk/actions/node@master
    env:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    with:
      args: --severity-threshold=high
```

---

## **7. Security Practices**

### **7.1 Application Security**

#### **Authentication & Authorization**
```typescript
// JWT Implementation (backend/src/middleware/auth.middleware.ts)
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### **Input Validation**
```typescript
// Validation Middleware (backend/src/middleware/validation.middleware.ts)
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    hallId: Joi.string().required(),
    date: Joi.date().min('now').required(),
    timeSlot: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
    purpose: Joi.string().min(5).max(200).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: 'Validation error', 
      details: error.details 
    });
  }
  next();
};
```

### **7.2 Infrastructure Security**

#### **Container Security**
```dockerfile
# Security best practices in Dockerfile
FROM node:18-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

#### **Secrets Management**
```yaml
# GitHub Secrets Configuration
secrets:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

# Environment-specific secrets
environments:
  staging:
    secrets:
      STAGING_MONGODB_URI: ${{ secrets.STAGING_MONGODB_URI }}
      STAGING_JWT_SECRET: ${{ secrets.STAGING_JWT_SECRET }}
  production:
    secrets:
      PRODUCTION_MONGODB_URI: ${{ secrets.PRODUCTION_MONGODB_URI }}
      PRODUCTION_JWT_SECRET: ${{ secrets.PRODUCTION_JWT_SECRET }}
```

### **7.3 CI/CD Security**

#### **Dependency Scanning**
```yaml
# Security scanning in CI/CD
- name: Run npm audit
  run: |
    npm audit --audit-level=high
    cd backend && npm audit --audit-level=high

- name: Run Snyk vulnerability scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high --file=package.json

- name: Container security scan
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'seminar-hall-frontend:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

#### **SAST Integration**
```yaml
# Static Application Security Testing
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript, typescript
    queries: security-and-quality

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    category: "/language:javascript"

- name: Upload SARIF results
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: trivy-results.sarif
```

# 🐳 Docker Setup for Seminar Hall Booking System

This document provides comprehensive instructions for running the Seminar Hall Booking System using Docker.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- At least 4GB RAM available for containers
- Ports 3000, 5000, 5601, 8080, 9002, 9003, 9090, 9200, 27017 available

## 🏗️ Architecture

The application consists of the following services:

### Core Application
- **Frontend**: Next.js application (Port 9002/9003)
- **Backend**: Node.js/Express API (Port 5000)
- **Database**: MongoDB (Port 27017)

### Monitoring Stack (Optional)
- **Jenkins**: CI/CD Pipeline (Port 8080)
- **Prometheus**: Metrics Collection (Port 9090)
- **Grafana**: Dashboards (Port 3000)
- **Elasticsearch**: Log Storage (Port 9200)
- **Kibana**: Log Visualization (Port 5601)

## 🚀 Quick Start

### Development Mode
```powershell
# Start development environment with hot reloading
.\docker-scripts\run-dev.ps1

# Or manually:
docker-compose -f docker-compose.dev.yml up --build
```

### Production Mode
```powershell
# Start production environment
.\docker-scripts\run-prod.ps1

# Or manually:
docker-compose up --build -d
```

## 📁 File Structure

```
├── Dockerfile                 # Frontend production build
├── docker-compose.yml         # Production environment
├── docker-compose.dev.yml     # Development environment
├── .env.docker               # Docker environment variables
├── backend/
│   ├── Dockerfile            # Backend multi-stage build
│   └── .dockerignore         # Backend ignore patterns
├── mongo-init/
│   └── init-mongo.js         # MongoDB initialization
└── docker-scripts/
    ├── build.ps1             # Build all images
    ├── run-dev.ps1           # Start development
    └── run-prod.ps1          # Start production
```

## 🔧 Configuration

### Environment Variables

Copy `.env.docker` to `.env` and modify as needed:

```bash
# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/seminar_hall_booking?authSource=admin

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### MongoDB Credentials
- **Username**: admin
- **Password**: password123
- **Database**: seminar_hall_booking

## 📊 Service URLs

### Development
- Frontend: http://localhost:9002
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Production
- Frontend: http://localhost:9003
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Monitoring (Production)
- Jenkins: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Kibana: http://localhost:5601

## 🛠️ Common Commands

```powershell
# Build all images
.\docker-scripts\build.ps1

# Start development
docker-compose -f docker-compose.dev.yml up

# Start production
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove all data
docker-compose down -v

# Rebuild specific service
docker-compose up --build [service-name]
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports are not in use
2. **Memory issues**: Increase Docker memory allocation
3. **Build failures**: Check Dockerfile syntax and dependencies

### Health Checks

All services include health checks. Check status:
```powershell
docker-compose ps
```

### Logs

View service logs:
```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 🔒 Security Notes

- Change default MongoDB credentials in production
- Update JWT secret key
- Use environment-specific .env files
- Enable SSL/TLS for production deployments
- Regularly update base images for security patches

## 📈 Performance Optimization

- Multi-stage builds reduce image size
- Health checks ensure service reliability
- Volume mounts for development hot reloading
- Production images run as non-root users
- Proper dependency caching in Dockerfiles

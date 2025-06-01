# Docker Commands for Seminar Hall Booking System

## 🐳 Current Docker Setup

### **Running Containers:**
- **Frontend**: `seminar-hall-frontend-dev` on port 9002
- **Backend**: `seminar-hall-backend-dev` on port 5000
- **Database**: MongoDB Atlas (Cloud)

## 📋 Essential Docker Commands

### **Check Container Status**
```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Check container logs
docker logs seminar-hall-frontend-dev
docker logs seminar-hall-backend-dev
```

### **Container Management**
```bash
# Start containers
docker start seminar-hall-frontend-dev seminar-hall-backend-dev

# Stop containers
docker stop seminar-hall-frontend-dev seminar-hall-backend-dev

# Restart containers
docker restart seminar-hall-frontend-dev seminar-hall-backend-dev

# Remove containers (if needed)
docker rm seminar-hall-frontend-dev seminar-hall-backend-dev
```

### **Build and Run (if rebuilding needed)**
```bash
# Build frontend image
docker build -t seminar-hall-booking-frontend .

# Build backend image
docker build -t seminar-hall-booking-backend ./backend

# Run frontend container
docker run -d --name seminar-hall-frontend-dev -p 9002:9002 seminar-hall-booking-frontend

# Run backend container
docker run -d --name seminar-hall-backend-dev -p 5000:5000 seminar-hall-booking-backend
```

### **Docker Compose Commands**
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## 🎯 Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 DOCKER ARCHITECTURE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Docker Container: Frontend                             │
│  ├── Image: seminar-hall-booking-frontend              │
│  ├── Port: 9002:9002                                   │
│  ├── API: http://localhost:5000/api                    │
│  └── Environment: development                          │
│                                                         │
│  Docker Container: Backend                              │
│  ├── Image: seminar-hall-booking-backend               │
│  ├── Port: 5000:5000                                   │
│  ├── Database: MongoDB Atlas                           │
│  └── Environment: development                          │
│                                                         │
│  External: MongoDB Atlas                                │
│  ├── Connection: Cloud Database                        │
│  ├── Database: seminar-hall-booking                    │
│  └── Shared with Production                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Troubleshooting

### **If containers won't start:**
```bash
# Check Docker daemon
docker version

# Check for port conflicts
netstat -ano | findstr :9002
netstat -ano | findstr :5000

# Remove and recreate containers
docker rm -f seminar-hall-frontend-dev seminar-hall-backend-dev
docker-compose up --build -d
```

### **If database connection fails:**
- Check MongoDB Atlas connection string
- Verify network connectivity
- Check backend environment variables

### **If frontend can't reach backend:**
- Verify both containers are running
- Check port mappings
- Verify API URL configuration

## 📊 Monitoring

### **Container Health Check:**
```bash
# Check container resource usage
docker stats

# Inspect container details
docker inspect seminar-hall-frontend-dev
docker inspect seminar-hall-backend-dev

# Execute commands inside container
docker exec -it seminar-hall-frontend-dev sh
docker exec -it seminar-hall-backend-dev sh
```

## 🎉 Benefits for Your Report

### **Professional Docker Implementation:**
- ✅ **Containerized Architecture**: Both frontend and backend in Docker
- ✅ **Environment Isolation**: Clean, reproducible development environment
- ✅ **Port Management**: Proper port mapping and networking
- ✅ **Database Integration**: Connected to cloud MongoDB Atlas
- ✅ **Development Workflow**: Hot reload and live development
- ✅ **Production Ready**: Same containers can be used for deployment

### **Report Highlights:**
- **Containerization**: Modern Docker-based development
- **Microservices**: Separate frontend and backend containers
- **Cloud Integration**: MongoDB Atlas database
- **Development Efficiency**: Consistent environment across team
- **Scalability**: Easy to scale and deploy containers

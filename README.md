# Seminar Hall Booking System

A web application for managing seminar hall bookings with admin and faculty interfaces.

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Running with Docker

1. Build and start the containers:
```bash
docker-compose up --build
```

2. Access the application:
- Frontend: http://localhost:9002
- Jenkins: http://localhost:8080
- Grafana: http://localhost:3000
- Kibana: http://localhost:5601
- Prometheus: http://localhost:9090

### Development Setup

If you want to run the application in development mode:

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Data Persistence

The application uses local storage for data persistence. When running with Docker, the data is stored in a volume mounted at `./data` in your project directory.

### Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=production
PORT=9002
```

## Features

- Faculty can book seminar halls
- Admin approval system
- Booking cancellation
- Conflict detection
- Real-time notifications
- Status tracking (Pending, Approved, Rejected, Cancelled)

## Monitoring & Observability

### Prometheus & Grafana
- Metrics collection and visualization
- System performance monitoring
- Custom dashboards for booking analytics
- Access Grafana at http://localhost:3000

### ELK Stack
- Centralized logging system
- Log analysis and visualization
- Access Kibana at http://localhost:5601

### Uptime Monitoring
- Basic uptime monitoring through built-in health checks
- Endpoint monitoring via Prometheus

## Security

### Snyk Integration
- Container vulnerability scanning
- Dependency security scanning
- Automated security testing in CI/CD

### SonarQube
- Code quality analysis
- Security vulnerability detection
- Test coverage reporting

## CI/CD Pipeline

### Jenkins Integration
1. Access Jenkins at http://localhost:8080
2. Pipeline stages:
   - Code Quality (SonarQube)
   - Security Scan (Snyk)
   - Build
   - Test
   - Deploy

### Docker Commands

- Start containers: `docker-compose up`
- Start in detached mode: `docker-compose up -d`
- Stop containers: `docker-compose down`
- View logs: `docker-compose logs -f`
- Rebuild containers: `docker-compose up --build`

### Maintenance

- Remove volumes: `docker-compose down -v`
- Clean up unused images: `docker system prune`

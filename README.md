# 🏛️ Seminar Hall Booking System

A comprehensive web application for managing seminar hall bookings with role-based access control, built with Next.js, Node.js, and MongoDB.

## 🚀 **Enterprise CI/CD Pipeline Status**

This project features a **world-class, enterprise-grade CI/CD pipeline** with:

✅ **Complete Testing Strategy**: Unit + Integration + E2E + Performance + Security
✅ **Advanced Security**: CodeQL + Semgrep + Snyk SAST scanning
✅ **Professional Artifacts**: Versioned builds with SBOM
✅ **Cloud Deployment**: Multi-environment with AWS/K8s support
✅ **Comprehensive Monitoring**: Real-time notifications and health checks

**Pipeline Execution Triggered**: $(date +"%Y-%m-%d %H:%M:%S UTC")

## 🚀 Features

- **User Management**: Faculty and Admin role-based authentication
- **Hall Management**: Add, edit, and manage seminar halls
- **Booking System**: Real-time booking with conflict detection
- **Dashboard**: Interactive calendar and booking overview
- **Responsive Design**: Mobile-friendly interface
- **Docker Support**: Fully containerized application
- **CI/CD Pipeline**: Automated testing and deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Nginx** - Reverse proxy and load balancing
- **MongoDB Atlas** - Cloud database

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB Atlas account
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/seminar-hall-booking.git
cd seminar-hall-booking
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MongoDB Atlas credentials
# Update MONGODB_URI, JWT_SECRET, etc.
```

### 3. Development with Docker
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or use the helper script
./docker-scripts/run-dev.ps1
```

### 4. Manual Development Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Start backend (in backend directory)
npm run dev

# Start frontend (in root directory)
npm run dev
```

## 🐳 Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up -d

# Build images
docker build -t seminar-hall-frontend .
docker build -t seminar-hall-backend ./backend

# View logs
docker-compose logs -f [service-name]
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `http://localhost:5000/api` |
| `NODE_ENV` | Environment mode | `development/production` |

### Default Credentials

For testing purposes:
- **Faculty**: `atlas@faculty.com` / `atlas123`
- **Admin**: `atlas@admin.com` / `atlas123`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Halls
- `GET /api/halls` - List all halls
- `POST /api/halls` - Create new hall (Admin only)
- `PUT /api/halls/:id` - Update hall (Admin only)
- `DELETE /api/halls/:id` - Delete hall (Admin only)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend && npm test

# Run linting
npm run lint
```

## 🚀 Deployment

### GitHub Actions CI/CD

1. **Push to GitHub** triggers automated pipeline
2. **Tests** run on every push/PR
3. **Docker images** built and pushed to GitHub Container Registry
4. **Deployment** to production environment

### Manual Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
├── src/                    # Frontend source code
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities and API client
│   └── types/            # TypeScript type definitions
├── backend/               # Backend source code
│   ├── src/              # Backend source files
│   ├── Dockerfile        # Backend container config
│   └── package.json      # Backend dependencies
├── .github/workflows/     # CI/CD pipeline
├── docker-scripts/        # Docker helper scripts
├── Dockerfile            # Frontend container config
├── docker-compose.*.yml  # Container orchestration
└── nginx.conf            # Reverse proxy config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@seminarhall.com or create an issue on GitHub.

## 🙏 Acknowledgments

- MongoDB Atlas for cloud database hosting
- GitHub for CI/CD and container registry
- Docker for containerization platform

# 🏛️ Seminar Hall Booking System

A modern web application for managing and booking seminar halls and auditoriums.

## 📋 Prerequisites

1. **Node.js (v16 or higher)**
   - Download from [official Node.js website](https://nodejs.org/)
   - Verify installation:
```bash
     node --version
     npm --version
     ```

2. **MongoDB**
   - **Option A: MongoDB Atlas (Recommended)**
     - Already configured and connected to: `mongodb+srv://cluster0.mongodb.net`
     - No additional setup needed as the application uses the production database
   
   - **Option B: Local MongoDB (For Development)**
     - Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
     - Start MongoDB service:
```bash
       # Windows
       net start MongoDB
       
       # macOS
       brew services start mongodb-community
       
       # Linux
       sudo systemctl start mongod
       ```

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

## 🚀 Installation Steps

1. **Clone the Repository**
```bash
   git clone <your-repository-url>
   cd Seminar-Hall-Booking
   ```

2. **Backend Setup**
```bash
   # Navigate to backend directory
   cd backend

   # Install dependencies
npm install

   # Create .env file (for local development)
   echo "PORT=5000
   MONGODB_URI=mongodb+srv://your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development" > .env

   # Start the backend server
npm run dev
```

3. **Frontend Setup**
```bash
   # Open a new terminal and navigate to project root
   cd Seminar-Hall-Booking

   # Install dependencies
   npm install

   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=https://seminar-hall-booking-backend.onrender.com/api
   NEXT_PUBLIC_URL=http://localhost:3000" > .env.local

   # Start the development server
   npm run dev
```

## 🔧 Configuration

### Environment Variables

1. **Backend (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

2. **Frontend (.env.local)**
   ```env
   NEXT_PUBLIC_API_URL=https://seminar-hall-booking-backend.onrender.com/api
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

### Perfect Sync Configuration

The application uses a "Perfect Sync" configuration where all environments (development, staging, production) use the same backend and database for consistent data:

- **Frontend URLs**:
  - Development: `http://localhost:3000`
  - Production: `https://seminar-hall-booking-psi.vercel.app`

- **Backend URL**:
  - All environments: `https://seminar-hall-booking-backend.onrender.com/api`

- **Database**:
  - All environments: MongoDB Atlas Cluster

## 🏃‍♂️ Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   # In a new terminal
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🧪 Testing

1. **Backend API Test**
```bash
   cd backend
npm test
   ```

2. **Frontend Test**
```bash
   npm test
   ```

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000  # Windows
   lsof -i :3000                 # macOS/Linux

   # Kill the process
   taskkill /PID <PID> /F       # Windows
   kill -9 <PID>                # macOS/Linux
   ```

2. **Node Modules Issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **MongoDB Connection Issues**
   - Verify MongoDB service is running
   - Check connection string in .env file
   - Ensure network access is configured in MongoDB Atlas

4. **API Connection Issues**
   - Check if backend server is running
   - Verify API URL in frontend .env.local
   - Check browser console for CORS errors

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Platform Documentation](https://render.com/docs)

## 🔐 Security Notes

1. **Environment Variables**
   - Never commit .env or .env.local files
   - Use strong JWT secrets
   - Regularly rotate production secrets

2. **Database Security**
   - Use strong MongoDB Atlas passwords
   - Configure IP whitelist in MongoDB Atlas
   - Enable database auditing

3. **API Security**
   - All endpoints require authentication except public routes
   - JWT tokens expire after 24 hours
   - Rate limiting is enabled on all routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

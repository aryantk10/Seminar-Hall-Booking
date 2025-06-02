import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './services/cron.service';
import { metricsMiddleware } from './middleware/metrics';
import { metricsService } from './services/metrics.service';

// Routes
import authRoutes from './routes/auth.routes';
import hallRoutes from './routes/hall.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middleware/error';
import { auth } from './middleware/auth';

dotenv.config();

const app: Express = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:9002',
  'https://seminar-hall-booking.onrender.com',
  'https://seminar-hall-booking-j69q.onrender.com',
  'https://seminar-hall-booking-psi.vercel.app'
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add metrics middleware before other middleware
app.use(metricsMiddleware as unknown as express.RequestHandler);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Seminar Hall Booking API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Debug route to test API
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'API is working',
    routes: ['auth', 'halls', 'bookings'],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

// Removed conflicting test routes that were blocking real auth routes

// API Routes
console.log('Registering auth routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered successfully');
} catch (error) {
  console.error('❌ Error registering auth routes:', error);
}

console.log('Registering hall routes...');
try {
  app.use('/api/halls', hallRoutes);
  console.log('✅ Hall routes registered successfully');
} catch (error) {
  console.error('❌ Error registering hall routes:', error);
}

console.log('Registering booking routes...');
try {
  app.use('/api/bookings', auth, bookingRoutes);
  console.log('✅ Booking routes registered successfully');
} catch (error) {
  console.error('❌ Error registering booking routes:', error);
}

// Error handling middleware
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seminar-hall-booking';
    console.log('Connecting to MongoDB:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.db.databaseName);
    // Initialize metrics after database connection
    await metricsService.initializeMetrics();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer(); 
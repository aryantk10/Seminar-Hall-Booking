import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './services/cron.service';

// Routes
import authRoutes from './routes/auth.routes';
import hallRoutes from './routes/hall.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://seminar-hall-booking.onrender.com',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Seminar Hall Booking API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug route to test API
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'API is working', routes: ['auth', 'halls', 'bookings'] });
});

// API Routes
console.log('Registering auth routes...');
app.use('/api/auth', authRoutes);
console.log('Registering hall routes...');
app.use('/api/halls', hallRoutes);
console.log('Registering booking routes...');
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seminar-hall-booking';
    console.log('Connecting to MongoDB:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.db.databaseName);
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
// Ultra-simple server for testing deployment
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Basic middleware
app.use(cors({
  origin: [
    'https://seminar-hall-booking-j69q.onrender.com',
    'http://localhost:3000',
    'http://localhost:9002'
  ],
  credentials: true
}));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Seminar Hall Booking API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API is working',
    routes: ['auth', 'halls', 'bookings'],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth', (req, res) => {
  res.json({
    message: 'Auth API is working',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile'
    ],
    timestamp: new Date().toISOString()
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Login endpoint accessible',
    note: 'This is a test endpoint - full auth will be enabled once deployment is stable',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;

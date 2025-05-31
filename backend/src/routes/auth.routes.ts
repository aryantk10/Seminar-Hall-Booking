import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';

const router = express.Router();

// Auth routes with GET endpoints for testing
router.get('/', (req, res) => {
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

router.get('/login', (req, res) => {
  res.json({
    message: 'Login endpoint accessible',
    method: 'This endpoint requires POST method',
    expectedBody: { email: 'string', password: 'string' },
    timestamp: new Date().toISOString()
  });
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router; 
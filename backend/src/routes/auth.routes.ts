import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';

const router = express.Router();

// Test endpoint for debugging
router.get('/', (req, res) => {
  res.json({
    message: 'Auth routes are working',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'PUT /api/auth/profile'
    ]
  });
});

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router; 
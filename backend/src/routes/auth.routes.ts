import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { register, login, getProfile, updateProfile } from '../controllers/auth.controller';

const router = express.Router();

// Auth routes - removed test endpoint to prevent conflicts

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router; 
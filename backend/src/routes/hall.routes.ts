import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
  getHallAvailability,
  populateHalls
} from '../controllers/hall.controller';

const router = express.Router();

// Public routes
router.get('/', getHalls);
router.get('/:id', getHallById);
router.get('/:id/availability', getHallAvailability);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Hall routes are working!' });
});

// Simple populate route for testing
router.get('/populate', async (req, res) => {
  try {
    res.json({
      message: 'Populate endpoint working',
      note: 'Database already populated with real halls via direct connection'
    });
  } catch (error: any) {
    console.error('Error in populate route:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createHall);
router.put('/:id', protect, authorize('admin'), updateHall);
router.delete('/:id', protect, authorize('admin'), deleteHall);

export default router; 
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
  getHallAvailability
} from '../controllers-new/hall.controller';

const router = express.Router();

// Public routes
router.get('/', getHalls);
router.get('/:id', getHallById);
router.get('/:id/availability', getHallAvailability);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createHall);
router.put('/:id', protect, authorize('admin'), updateHall);
router.delete('/:id', protect, authorize('admin'), deleteHall);

export default router; 
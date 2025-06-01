import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookings,
  getMyBookings,
  getApprovedBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from '../controllers/booking.controller';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, authorize('admin'), getBookings);

router.route('/my').get(protect, getMyBookings);
router.route('/approved').get(protect, getApprovedBookings); // Public calendar data

// Cleanup endpoint to remove corrupted bookings (public access for debugging)
router.route('/cleanup').get(async (req, res) => {
  try {
    const Booking = require('../models/booking.model').default;

    // Remove bookings with null users or test halls
    const result = await Booking.deleteMany({
      $or: [
        { user: null },
        { user: { $exists: false } },
        { 'hall.name': 'Test Hall' },
        { hall: null },
        { hall: { $exists: false } }
      ]
    });

    res.json({
      message: `Cleaned up ${result.deletedCount} corrupted bookings`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Cleanup failed' });
  }
});

router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, cancelBooking); // Allow users to delete their own bookings

router.route('/:id/cancel')
  .post(protect, cancelBooking);

router.route('/:id/approve')
  .put(protect, authorize('admin'), approveBooking); // Changed to PUT

router.route('/:id/reject')
  .put(protect, authorize('admin'), rejectBooking); // Changed to PUT

export default router; 
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createBooking,
  getBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
} from '../controllers/booking.controller';

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, authorize('admin'), getBookings);

router.route('/my').get(protect, getBookings);

router.route('/:id')
  .get(protect, getBookingById)
  .post(protect, authorize('admin'), approveBooking)
  .delete(protect, authorize('admin'), rejectBooking);

router.route('/:id/cancel')
  .post(protect, cancelBooking);

router.route('/:id/approve')
  .post(protect, authorize('admin'), approveBooking);

router.route('/:id/reject')
  .post(protect, authorize('admin'), rejectBooking);

export default router; 
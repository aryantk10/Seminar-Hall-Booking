import { Request, Response } from 'express';
import Booking from '../models/booking.model';
import Hall from '../models/hall.model';

interface AuthRequest extends Request {
  user?: any;
}

// Check for booking conflicts
const checkBookingConflict = async (hallId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => {
  const conflictQuery: any = {
    hall: hallId,
    status: 'approved',
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  };

  if (excludeBookingId) {
    Object.assign(conflictQuery, { _id: { $ne: excludeBookingId } });
  }

  const conflictingBooking = await Booking.findOne(conflictQuery);
  return conflictingBooking;
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hall: hallId, startTime, endTime } = req.body;

    // Check if hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(hallId, new Date(startTime), new Date(endTime));
    if (conflict) {
      res.status(400).json({ message: 'Hall is already booked for this time slot' });
      return;
    }

    const booking = await Booking.create({
      ...req.body,
      user: req.user._id,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('hall', 'name location');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hall', 'name location')
      .sort('-createdAt');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('hall', 'name location');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to view this booking' });
      return;
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startTime, endTime, hall: hallId } = req.body;

    if (startTime && endTime && hallId) {
      const conflict = await checkBookingConflict(
        hallId,
        new Date(startTime),
        new Date(endTime),
        req.params.id
      );
      if (conflict) {
        res.status(400).json({ message: 'Hall is already booked for this time slot' });
        return;
      }
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(
      booking.hall.toString(),
      booking.startTime,
      booking.endTime,
      booking._id.toString()
    );
    if (conflict) {
      res.status(400).json({ message: 'Hall is already booked for this time slot' });
      return;
    }

    booking.status = 'approved';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    booking.status = 'rejected';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
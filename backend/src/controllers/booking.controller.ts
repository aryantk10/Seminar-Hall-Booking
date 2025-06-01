import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/booking.model';
import Hall from '../models/hall.model';
import User from '../models/user.model';

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
    const { hallId, startDate, endDate, purpose, attendees, requirements } = req.body;

    // Find hall by name (since frontend sends hall IDs that don't match MongoDB ObjectIds)
    const hallMapping = {
      'apex-auditorium': 'APEX Auditorium',
      'esb-hall-1': 'ESB Seminar Hall - I',
      'esb-hall-2': 'ESB Seminar Hall - II',
      'esb-hall-3': 'ESB Seminar Hall - III',
      'des-hall-1': 'DES Seminar Hall - I',
      'des-hall-2': 'DES Seminar Hall - II',
      'lhc-hall-1': 'LHC Seminar Hall - I',
      'lhc-hall-2': 'LHC Seminar Hall - II'
    };

    const hallName = hallMapping[hallId] || hallId;
    const hall = await Hall.findOne({ name: hallName });
    if (!hall) {
      res.status(404).json({ message: `Hall not found: ${hallName}` });
      return;
    }

    // Parse dates and extract time from requirements
    const startTime = new Date(startDate);
    const endTime = new Date(endDate);

    // Extract time from requirements if provided
    if (requirements && typeof requirements === 'string' && requirements.includes('Time:')) {
      const timeMatch = requirements.match(/Time:\s*(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (timeMatch) {
        const [, startTimeStr, endTimeStr] = timeMatch;
        const [startHour, startMin] = startTimeStr.split(':').map(Number);
        const [endHour, endMin] = endTimeStr.split(':').map(Number);

        startTime.setHours(startHour, startMin, 0, 0);
        endTime.setHours(endHour, endMin, 0, 0);
      }
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(hall._id.toString(), startTime, endTime);
    if (conflict) {
      res.status(400).json({ message: 'Hall is already booked for this time slot' });
      return;
    }

    const booking = await Booking.create({
      hall: hall._id,
      user: req.user._id,
      startTime,
      endTime,
      purpose,
      attendees: attendees || 1,
      requirements: requirements ? [requirements] : [],
      status: 'pending',
    });

    // Populate the response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hall', 'name location')
      .populate('user', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking creation error:', error);
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

// Get approved bookings for calendar view (public access for all authenticated users)
export const getApprovedBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ status: 'approved' })
      .populate('hall', 'name location')
      .populate('user', 'name')
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if the user is the owner of the booking or an admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this booking' });
      return;
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if the user is the owner of the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to cancel this booking' });
      return;
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
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

    // Allow changing from any status to approved
    if (booking.status === 'cancelled') {
      res.status(400).json({ message: 'Cannot approve a cancelled booking' });
      return;
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(
      booking.hall.toString(),
      booking.startTime,
      booking.endTime,
      booking._id
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

    // Allow changing from any status to rejected except cancelled
    if (booking.status === 'cancelled') {
      res.status(400).json({ message: 'Cannot reject a cancelled booking' });
      return;
    }

    booking.status = 'rejected';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 
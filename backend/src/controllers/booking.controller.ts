import { Request, Response } from 'express';
import Booking, { IBooking } from '../models/booking.model';
import Hall from '../models/hall.model';
import User from '../models/user.model';
import { 
    bookingCounter, 
    activeBookingsGauge, 
    hallUtilizationGauge,
    bookingDurationHistogram 
} from '../middleware/metrics';

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

// Helper function to update metrics
const updateBookingMetrics = async (hallId: string) => {
    try {
        const hall = await Hall.findById(hallId);
        if (!hall) return;

        // Count active bookings for this hall
        const activeBookings = await Booking.countDocuments({
            hallId,
            status: 'approved',
            startTime: { $lte: new Date() },
            endTime: { $gt: new Date() }
        });

        // Update active bookings gauge
        activeBookingsGauge.set({ hall_name: hall.name }, activeBookings);

        // Calculate utilization rate (bookings for next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const totalBookingHours = await Booking.aggregate([
            {
                $match: {
                    hallId: hallId,
                    status: 'approved',
                    startTime: { $gte: new Date() },
                    endTime: { $lte: nextWeek }
                }
            },
            {
                $group: {
                    _id: null,
                    totalHours: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$endTime', '$startTime'] },
                                3600000 // Convert ms to hours
                            ]
                        }
                    }
                }
            }
        ]);

        const totalPossibleHours = 24 * 7; // 24 hours * 7 days
        const utilizationRate = totalBookingHours.length > 0 
            ? (totalBookingHours[0].totalHours / totalPossibleHours) * 100 
            : 0;

        // Update utilization gauge
        hallUtilizationGauge.set({ hall_name: hall.name }, utilizationRate);
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hall: hallId, startTime, endTime } = req.body;

    // Check if hall exists - try both _id and frontendId
    let hall = await Hall.findById(hallId);
    if (!hall) {
      hall = await Hall.findOne({ frontendId: hallId });
    }

    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }

    // Check for conflicts
    const conflict = await checkBookingConflict(hall._id, new Date(startTime), new Date(endTime));
    if (conflict) {
      res.status(400).json({ message: 'Hall is already booked for this time slot' });
      return;
    }

    const booking = await Booking.create({
      ...req.body,
      hall: hall._id, // Use the MongoDB _id for the booking
      user: req.user._id,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
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
    console.log('🔍 getMyBookings called for user:', req.user._id);

    // First, get all bookings to debug
    const allBookings = await Booking.find({})
      .populate('hall', 'name location')
      .populate('user', 'name email');

    console.log('📊 Total bookings in database:', allBookings.length);
    console.log('📊 All bookings:', allBookings.map(b => ({
      id: b._id,
      userId: (b.user as any)?._id || b.user,
      userName: (b.user as any)?.name,
      hallName: (b.hall as any)?.name,
      purpose: b.purpose
    })));

    // Now get user-specific bookings with proper population
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hall', 'name location')
      .populate('user', 'name email') // Add user population
      .sort('-createdAt');

    console.log('📊 User bookings found:', bookings.length);
    console.log('📊 User bookings:', bookings.map(b => ({
      id: b._id,
      hallName: (b.hall as any)?.name,
      purpose: b.purpose,
      status: b.status
    })));

    res.json(bookings);
  } catch (error) {
    console.error('❌ getMyBookings error:', error);
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

    // Increment counter for new status
    const hall = await Hall.findById(booking.hall);
    bookingCounter.inc({ status: booking.status, hall_name: hall?.name || 'unknown' });

    // Update other metrics
    await updateBookingMetrics(booking.hall.toString());

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
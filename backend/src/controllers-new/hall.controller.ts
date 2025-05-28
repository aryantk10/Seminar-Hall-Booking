import { Request, Response } from 'express';
import Hall, { IHall } from '../models/hall.model';
import Booking from '../models/booking.model';

interface AuthRequest extends Request {
  user?: any;
}

export const createHall = async (req: Request, res: Response): Promise<void> => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHalls = async (req: Request, res: Response): Promise<void> => {
  try {
    const halls = await Hall.find({});
    res.json(halls);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHallById = async (req: Request, res: Response): Promise<void> => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hall = await Hall.findByIdAndDelete(req.params.id);
    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }
    // Delete all bookings associated with this hall
    await Booking.deleteMany({ hall: req.params.id });
    res.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHallAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Please provide start and end dates' });
      return;
    }

    const bookings = await Booking.find({
      hall: req.params.id,
      $or: [
        {
          startTime: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
        {
          endTime: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
      ],
    }).select('startTime endTime status');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 
 
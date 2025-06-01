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

export const populateHalls = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Starting hall population...');

    // Clear existing halls
    const deleteResult = await Hall.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing halls`);

    const hallsData = [
      {
        name: 'APEX Auditorium',
        capacity: 1000,
        location: 'APEX Block',
        facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'],
        description: 'Large auditorium for major events',
        isAvailable: true
      },
      {
        name: 'ESB Seminar Hall - I',
        capacity: 315,
        location: 'Engineering Sciences Block (ESB)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
        description: 'Seminar hall in ESB',
        isAvailable: true
      },
      {
        name: 'ESB Seminar Hall - II',
        capacity: 315,
        location: 'Engineering Sciences Block (ESB)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
        description: 'Seminar hall in ESB',
        isAvailable: true
      },
      {
        name: 'ESB Seminar Hall - III',
        capacity: 140,
        location: 'Engineering Sciences Block (ESB)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
        description: 'Smaller seminar hall in ESB',
        isAvailable: true
      },
      {
        name: 'DES Seminar Hall - I',
        capacity: 200,
        location: 'Department of Engineering Sciences (DES)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Whiteboard'],
        description: 'Seminar hall in DES',
        isAvailable: true
      },
      {
        name: 'DES Seminar Hall - II',
        capacity: 200,
        location: 'Department of Engineering Sciences (DES)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Whiteboard'],
        description: 'Seminar hall in DES',
        isAvailable: true
      },
      {
        name: 'LHC Seminar Hall - I',
        capacity: 115,
        location: 'Lecture Hall Complex (LHC)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
        description: 'Seminar hall in LHC',
        isAvailable: true
      },
      {
        name: 'LHC Seminar Hall - II',
        capacity: 115,
        location: 'Lecture Hall Complex (LHC)',
        facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
        description: 'Seminar hall in LHC',
        isAvailable: true
      }
    ];

    console.log(`Attempting to create ${hallsData.length} halls...`);
    const createdHalls = await Hall.insertMany(hallsData);
    console.log(`Successfully created ${createdHalls.length} halls`);

    res.json({
      message: `Successfully created ${createdHalls.length} halls`,
      halls: createdHalls.map(hall => ({
        id: hall._id,
        name: hall.name,
        capacity: hall.capacity,
        location: hall.location
      }))
    });
  } catch (error: any) {
    console.error('Error populating halls:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
 
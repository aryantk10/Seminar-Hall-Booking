import { Request, Response } from 'express';
import Hall, { IHall } from '../models/hall.model';
import Booking from '../models/booking.model';

interface AuthRequest extends Request {
  user?: any;
}

export const createHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, capacity, location, facilities, description, images } = req.body;

    // Validate required fields
    if (!name || !capacity || !location) {
      res.status(400).json({ message: 'Name, capacity, and location are required' });
      return;
    }

    // Check if hall with same name already exists
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      res.status(400).json({ message: 'Hall with this name already exists' });
      return;
    }

    const hallData = {
      name,
      capacity: parseInt(capacity),
      location,
      facilities: facilities || [],
      description: description || '',
      images: images || []
    };

    const hall = await Hall.create(hallData);

    console.log(`✅ Hall created: ${name} by ${req.user?.name || 'Admin'}`);
    res.status(201).json(hall);
  } catch (error: any) {
    console.error('❌ Error creating hall:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
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
    const { name, capacity, location, facilities, description, images } = req.body;
    const hallId = req.params.id;

    // Check if hall exists
    const existingHall = await Hall.findById(hallId);
    if (!existingHall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }

    // If name is being changed, check for duplicates
    if (name && name !== existingHall.name) {
      const duplicateHall = await Hall.findOne({ name, _id: { $ne: hallId } });
      if (duplicateHall) {
        res.status(400).json({ message: 'Hall with this name already exists' });
        return;
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (capacity) updateData.capacity = parseInt(capacity);
    if (location) updateData.location = location;
    if (facilities) updateData.facilities = facilities;
    if (description !== undefined) updateData.description = description;
    if (images) updateData.images = images;

    // Update the hall
    const hall = await Hall.findByIdAndUpdate(hallId, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(`✅ Hall updated: ${hall?.name} (ID: ${hallId}) by ${req.user?.name || 'Admin'}`);
    res.json({
      message: 'Hall updated successfully',
      hall
    });
  } catch (error: any) {
    console.error('❌ Error updating hall:', error);
    res.status(500).json({
      message: 'Error updating hall',
      error: error.message
    });
  }
};

export const deleteHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const hallId = req.params.id;

    // Check if hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      res.status(404).json({ message: 'Hall not found' });
      return;
    }

    // Check for existing bookings
    const existingBookings = await Booking.find({ hall: hallId });
    const activeBookings = existingBookings.filter(booking =>
      booking.status === 'approved' || booking.status === 'pending'
    );

    if (activeBookings.length > 0) {
      res.status(400).json({
        message: `Cannot delete hall. There are ${activeBookings.length} active bookings.`,
        activeBookings: activeBookings.length
      });
      return;
    }

    // Delete the hall
    await Hall.findByIdAndDelete(hallId);

    // Delete all associated bookings (cancelled/rejected ones)
    const deletedBookings = await Booking.deleteMany({ hall: hallId });

    console.log(`✅ Hall deleted: ${hall.name} (ID: ${hallId}) by ${req.user?.name || 'Admin'}`);
    console.log(`✅ Deleted ${deletedBookings.deletedCount} associated bookings`);

    res.json({
      message: 'Hall deleted successfully',
      deletedBookings: deletedBookings.deletedCount,
      hallName: hall.name
    });
  } catch (error: any) {
    console.error('❌ Error deleting hall:', error);
    res.status(500).json({
      message: 'Error deleting hall',
      error: error.message
    });
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
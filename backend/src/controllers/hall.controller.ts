import { Request, Response } from 'express';
import Hall, { IHall } from '../models/hall.model';
import Booking from '../models/booking.model';

interface AuthRequest extends Request {
  user?: any;
}

export const createHall = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, capacity, location, amenities, description, image, block, type } = req.body;

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

    // Generate unique ID based on name
    const id = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);

    const hallData = {
      id,
      name,
      capacity: parseInt(capacity),
      location,
      amenities: amenities || [],
      description: description || '',
      image: image || `/images/halls/default-hall.jpg`,
      block: block || 'Main',
      type: type || 'Seminar Hall'
    };

    const hall = await Hall.create(hallData);

    console.log(`✅ Hall created: ${name} (ID: ${id}) by ${req.user?.name || 'Admin'}`);
    res.status(201).json({
      message: 'Hall created successfully',
      hall
    });
  } catch (error: any) {
    console.error('❌ Error creating hall:', error);
    res.status(400).json({
      message: 'Error creating hall',
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
    const { name, capacity, location, amenities, description, image, block, type } = req.body;
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
    if (amenities) updateData.amenities = amenities;
    if (description !== undefined) updateData.description = description;
    if (image) updateData.image = image;
    if (block) updateData.block = block;
    if (type) updateData.type = type;

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
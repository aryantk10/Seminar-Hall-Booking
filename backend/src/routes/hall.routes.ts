import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
  getHallAvailability,
  populateHalls
} from '../controllers-new/hall.controller';

const router = express.Router();

// Public routes
router.get('/', getHalls);
router.get('/:id', getHallById);
router.get('/:id/availability', getHallAvailability);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Hall routes are working!' });
});

// Setup route (for initial database population) - using GET for easy browser testing
router.get('/populate', async (req, res) => {
  try {
    // Import Hall model properly
    const Hall = require('../models/hall.model').default;

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
      halls: createdHalls.map((hall: any) => ({
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
      error: error.message
    });
  }
});

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createHall);
router.put('/:id', protect, authorize('admin'), updateHall);
router.delete('/:id', protect, authorize('admin'), deleteHall);

export default router; 
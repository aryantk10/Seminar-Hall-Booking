const mongoose = require('mongoose');
const Hall = require('../src/models/hall.model.ts').default;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://aryantk1020:Timber2014@cluster0.ixhqy.mongodb.net/seminar-hall-booking?retryWrites=true&w=majority');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Hall data matching frontend configuration
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

const populateHalls = async () => {
  try {
    await connectDB();
    
    // Clear existing halls
    await Hall.deleteMany({});
    console.log('Cleared existing halls');
    
    // Insert new halls
    const createdHalls = await Hall.insertMany(hallsData);
    console.log(`Created ${createdHalls.length} halls:`);
    
    createdHalls.forEach(hall => {
      console.log(`- ${hall.name} (ID: ${hall._id})`);
    });
    
    console.log('\nHalls populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating halls:', error);
    process.exit(1);
  }
};

populateHalls();

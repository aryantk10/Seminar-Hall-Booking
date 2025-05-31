// MongoDB initialization script for Seminar Hall Booking System

// Switch to the application database
db = db.getSiblingDB('seminar_hall_booking');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'seminar_hall_booking'
    }
  ]
});

// Create collections with initial data
db.createCollection('users');
db.createCollection('halls');
db.createCollection('bookings');
db.createCollection('departments');

// Insert sample departments
db.departments.insertMany([
  {
    name: 'Computer Science',
    code: 'CS',
    head: 'Dr. John Smith',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Information Technology',
    code: 'IT',
    head: 'Dr. Jane Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Electronics and Communication',
    code: 'ECE',
    head: 'Dr. Bob Johnson',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert official institute halls
db.halls.insertMany([
  // Auditoriums
  {
    name: 'Apex Block Auditorium',
    capacity: 1000,
    location: 'APEX Block',
    facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning', 'Parking'],
    description: 'State-of-the-art auditorium for graduation ceremonies, first year inauguration, fresher\'s party, felicitation functions, alumni events, and major department level events.',
    images: ['/images/halls/apex-auditorium.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Seminar Hall 1',
    capacity: 315,
    location: 'Engineering Sciences Block (ESB)',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
    description: 'Large seminar hall perfect for department events, presentations, and academic sessions.',
    images: ['/images/halls/esb-seminar-hall-1.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Seminar Hall 2',
    capacity: 140,
    location: 'Engineering Sciences Block (ESB)',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Medium-sized seminar hall ideal for focused academic sessions and workshops.',
    images: ['/images/halls/esb-seminar-hall-2.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'DES Hi-Tech Seminar Hall',
    capacity: 200,
    location: 'Department of Engineering Sciences (DES)',
    facilities: ['Advanced Projector', 'Interactive Whiteboard', 'Sound System', 'Wi-Fi', 'Video Conferencing'],
    description: 'Modern hi-tech seminar facility with advanced audio-visual systems.',
    images: ['/images/halls/des-hitech-seminar-hall.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'LHC Seminar Hall 1',
    capacity: 115,
    location: 'Lecture Hall Complex (LHC)',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Intimate learning space ideal for focused discussions and smaller academic events.',
    images: ['/images/halls/lhc-seminar-hall-1.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'LHC Seminar Hall 2',
    capacity: 115,
    location: 'Lecture Hall Complex (LHC)',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Collaborative learning environment perfect for seminars and workshops.',
    images: ['/images/halls/lhc-seminar-hall-2.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Board Rooms
  {
    name: 'Apex Board Room',
    capacity: 60,
    location: 'APEX Block',
    facilities: ['Conference Table', 'Video Conferencing', 'Projector', 'Wi-Fi', 'Air Conditioning'],
    description: 'Executive board room for governing body meetings, academic council meetings, and principal\'s meetings.',
    images: ['/images/halls/apex-board-room.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Board Room',
    capacity: 60,
    location: 'Engineering Sciences Block (ESB)',
    facilities: ['Conference Table', 'Video Conferencing', 'Projector', 'Wi-Fi'],
    description: 'Professional meeting space for board discussions and committee meetings.',
    images: ['/images/halls/esb-board-room.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'DES Board Room 1',
    capacity: 50,
    location: 'Department of Engineering Sciences (DES)',
    facilities: ['Conference Table', 'Projector', 'Wi-Fi', 'Air Conditioning'],
    description: 'Executive meeting room for board of studies meetings and departmental discussions.',
    images: ['/images/halls/des-board-room-1.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'DES Board Room 2',
    capacity: 45,
    location: 'Department of Engineering Sciences (DES)',
    facilities: ['Conference Table', 'Projector', 'Wi-Fi'],
    description: 'Compact meeting space for board of examinations meetings and smaller committee sessions.',
    images: ['/images/halls/des-board-room-2.jpg'],
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.bookings.createIndex({ hallId: 1, date: 1, startTime: 1 });
db.bookings.createIndex({ userId: 1 });
db.halls.createIndex({ name: 1 }, { unique: true });

print('MongoDB initialization completed successfully!');

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

// Insert sample halls
db.halls.insertMany([
  {
    name: 'Main Auditorium',
    capacity: 500,
    location: 'Ground Floor, Main Building',
    facilities: ['Projector', 'Sound System', 'Air Conditioning', 'Stage'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Conference Hall A',
    capacity: 100,
    location: 'First Floor, Admin Building',
    facilities: ['Projector', 'Whiteboard', 'Air Conditioning'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Seminar Hall B',
    capacity: 50,
    location: 'Second Floor, Academic Block',
    facilities: ['Projector', 'Whiteboard'],
    isActive: true,
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

const { MongoClient } = require('mongodb');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://aryantk1020:Timber2014*@cluster0.bk2olft.mongodb.net/seminar-hall-booking?retryWrites=true&w=majority&appName=Cluster0';

// Real institutional halls data
const realHalls = [
  {
    name: 'APEX Auditorium',
    capacity: 1000,
    location: 'APEX Block',
    facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Air Conditioning'],
    description: 'Large auditorium for major events and conferences',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Seminar Hall - I',
    capacity: 315,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Medium-sized seminar hall for academic events',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Seminar Hall - II',
    capacity: 140,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Compact seminar hall for smaller gatherings',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ESB Seminar Hall - III',
    capacity: 115,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Small seminar hall for intimate meetings',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'DES Seminar Hall - I',
    capacity: 200,
    location: 'DES Hi-Tech Block',
    facilities: ['Smart Board', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Modern seminar hall with latest technology',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'DES Seminar Hall - II',
    capacity: 200,
    location: 'DES Hi-Tech Block',
    facilities: ['Smart Board', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Modern seminar hall with latest technology',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'LHC Seminar Hall - I',
    capacity: 115,
    location: 'LHC Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Well-equipped seminar hall for academic purposes',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'LHC Seminar Hall - II',
    capacity: 115,
    location: 'LHC Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Well-equipped seminar hall for academic purposes',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function populateDatabase() {
  console.log('🏢 Direct MongoDB Atlas Population...\n');
  console.log('🎯 Target: MongoDB Atlas Cluster0');
  console.log('🗄️ Database: seminar-hall-booking');
  console.log('📋 Collection: halls\n');

  let client;

  try {
    // Connect to MongoDB Atlas
    console.log('1️⃣ Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Get database and collection
    const db = client.db('seminar-hall-booking');
    const hallsCollection = db.collection('halls');

    // Check current halls
    console.log('\n2️⃣ Checking current halls in database...');
    const currentHalls = await hallsCollection.find({}).toArray();
    console.log(`📊 Current halls in database: ${currentHalls.length}`);
    
    if (currentHalls.length > 0) {
      console.log('📋 Existing halls:');
      currentHalls.forEach(hall => {
        console.log(`- ${hall.name} (Capacity: ${hall.capacity})`);
      });
    }

    // Clear existing halls (optional - comment out if you want to keep existing)
    console.log('\n3️⃣ Clearing existing halls...');
    const deleteResult = await hallsCollection.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing halls`);

    // Insert new halls
    console.log('\n4️⃣ Inserting real institutional halls...');
    const insertResult = await hallsCollection.insertMany(realHalls);
    console.log(`✅ Successfully inserted ${insertResult.insertedCount} halls`);

    // Verify insertion
    console.log('\n5️⃣ Verifying inserted halls...');
    const newHalls = await hallsCollection.find({}).toArray();
    console.log(`📊 Total halls now in database: ${newHalls.length}`);
    
    console.log('\n📋 All halls in database:');
    newHalls.forEach((hall, index) => {
      console.log(`${index + 1}. ${hall.name}`);
      console.log(`   - Capacity: ${hall.capacity}`);
      console.log(`   - Location: ${hall.location}`);
      console.log(`   - ID: ${hall._id}`);
      console.log('');
    });

    // Test the mapping
    console.log('6️⃣ Testing hall name mapping...');
    const testMappings = [
      { frontendId: 'apex-auditorium', expectedName: 'APEX Auditorium' },
      { frontendId: 'esb-hall-1', expectedName: 'ESB Seminar Hall - I' },
      { frontendId: 'des-hall-1', expectedName: 'DES Seminar Hall - I' },
      { frontendId: 'lhc-hall-1', expectedName: 'LHC Seminar Hall - I' }
    ];

    for (const mapping of testMappings) {
      const hall = await hallsCollection.findOne({ name: mapping.expectedName });
      if (hall) {
        console.log(`✅ ${mapping.frontendId} → ${mapping.expectedName} (Found)`);
      } else {
        console.log(`❌ ${mapping.frontendId} → ${mapping.expectedName} (Not Found)`);
      }
    }

    console.log('\n🎉 Database population completed successfully!');
    console.log('🔄 Your backend will now find real halls instead of "Test Hall"');
    console.log('📱 Try creating a booking - it should now use the actual hall names!');

  } catch (error) {
    console.error('💥 Database population failed:', error.message);
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication failed - please check your MongoDB credentials');
    } else if (error.message.includes('network')) {
      console.error('🌐 Network error - please check your internet connection');
    }
  } finally {
    // Close connection
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the population
populateDatabase();

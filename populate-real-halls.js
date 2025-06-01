const https = require('https');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'seminar-hall-booking-backend.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: headers,
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Real institutional halls data
const realHalls = [
  {
    name: 'APEX Auditorium',
    capacity: 1000,
    location: 'APEX Block',
    facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Air Conditioning'],
    description: 'Large auditorium for major events and conferences',
    isAvailable: true
  },
  {
    name: 'ESB Seminar Hall - I',
    capacity: 315,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Medium-sized seminar hall for academic events',
    isAvailable: true
  },
  {
    name: 'ESB Seminar Hall - II',
    capacity: 140,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Compact seminar hall for smaller gatherings',
    isAvailable: true
  },
  {
    name: 'ESB Seminar Hall - III',
    capacity: 115,
    location: 'ESB Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Small seminar hall for intimate meetings',
    isAvailable: true
  },
  {
    name: 'DES Seminar Hall - I',
    capacity: 200,
    location: 'DES Hi-Tech Block',
    facilities: ['Smart Board', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Modern seminar hall with latest technology',
    isAvailable: true
  },
  {
    name: 'DES Seminar Hall - II',
    capacity: 200,
    location: 'DES Hi-Tech Block',
    facilities: ['Smart Board', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Modern seminar hall with latest technology',
    isAvailable: true
  },
  {
    name: 'LHC Seminar Hall - I',
    capacity: 115,
    location: 'LHC Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Well-equipped seminar hall for academic purposes',
    isAvailable: true
  },
  {
    name: 'LHC Seminar Hall - II',
    capacity: 115,
    location: 'LHC Block',
    facilities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    description: 'Well-equipped seminar hall for academic purposes',
    isAvailable: true
  }
];

async function populateRealHalls() {
  console.log('🏢 Populating Real Institutional Halls...\n');
  console.log('🎯 Target Database: MongoDB Atlas Cluster0');
  console.log('🔗 Backend: Render (seminar-hall-booking-backend.onrender.com)');
  console.log('🌐 Frontend: Vercel\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'aryantk1020@outlook.com',
      password: 'Timber2014*'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Admin login failed:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Check current halls
    console.log('\n2️⃣ Checking current halls in database...');
    const currentHallsResponse = await makeRequest('/api/halls');
    
    if (currentHallsResponse.status === 200) {
      console.log('📋 Current halls in database:');
      currentHallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (Capacity: ${hall.capacity})`);
      });
    }

    // Step 3: Create real halls
    console.log('\n3️⃣ Creating real institutional halls...');
    let successCount = 0;
    let skipCount = 0;

    for (const hallData of realHalls) {
      console.log(`\n📍 Creating: ${hallData.name}...`);
      
      const createResponse = await makeRequest('/api/halls', 'POST', hallData, token);
      
      if (createResponse.status === 201) {
        console.log(`✅ Created: ${hallData.name}`);
        successCount++;
      } else if (createResponse.status === 400 && createResponse.data.message?.includes('already exists')) {
        console.log(`⏭️ Skipped: ${hallData.name} (already exists)`);
        skipCount++;
      } else {
        console.log(`❌ Failed: ${hallData.name} - ${createResponse.data.message || 'Unknown error'}`);
      }
    }

    // Step 4: Verify final state
    console.log('\n4️⃣ Verifying final database state...');
    const finalHallsResponse = await makeRequest('/api/halls');
    
    if (finalHallsResponse.status === 200) {
      console.log('✅ Final halls in database:');
      finalHallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (ID: ${hall._id}, Capacity: ${hall.capacity})`);
      });
      
      console.log(`\n📊 Summary:`);
      console.log(`- Total halls in database: ${finalHallsResponse.data.length}`);
      console.log(`- Successfully created: ${successCount}`);
      console.log(`- Already existed: ${skipCount}`);
      console.log(`- Failed: ${realHalls.length - successCount - skipCount}`);
    }

    // Step 5: Test booking with real hall
    console.log('\n5️⃣ Testing booking with real hall...');
    const testBookingResponse = await makeRequest('/api/bookings', 'POST', {
      hallId: 'apex-auditorium',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      purpose: 'Testing with real APEX Auditorium',
      attendees: 1,
      requirements: 'Time: 17:00 - 18:00'
    }, token);

    if (testBookingResponse.status === 201) {
      console.log('🎉 SUCCESS! Booking created with real hall:');
      console.log(`- Hall: ${testBookingResponse.data.hall?.name}`);
      console.log(`- Booking ID: ${testBookingResponse.data._id}`);
    } else {
      console.log('❌ Test booking failed:', testBookingResponse.data);
    }

    console.log('\n🎉 Real halls population complete!');
    console.log('🔄 Your app now uses actual institutional halls instead of "Test Hall"');

  } catch (error) {
    console.error('💥 Population failed:', error.message);
  }
}

populateRealHalls();

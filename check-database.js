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
      headers: headers
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

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function checkDatabase() {
  console.log('🔍 Checking current database state...\n');

  try {
    // Check halls
    console.log('1️⃣ Checking halls in database...');
    const hallsResponse = await makeRequest('/api/halls');
    console.log('Halls response status:', hallsResponse.status);
    
    if (hallsResponse.status === 200) {
      console.log('📋 Current halls in database:');
      hallsResponse.data.forEach((hall, index) => {
        console.log(`${index + 1}. Name: "${hall.name}" | ID: ${hall._id} | Capacity: ${hall.capacity}`);
      });
    } else {
      console.log('❌ Failed to get halls:', hallsResponse.data);
    }

    // Check if we can create a hall with the exact name we need
    console.log('\n2️⃣ Testing hall creation...');
    
    // First login as admin
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@admin.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      const token = loginResponse.data.token;
      console.log('✅ Admin login successful');

      // Try to create APEX Auditorium
      const createHallResponse = await makeRequest('/api/halls', 'POST', {
        name: 'APEX Auditorium',
        capacity: 1000,
        location: 'APEX Block',
        facilities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting'],
        description: 'Large auditorium for major events',
        isAvailable: true
      }, token);

      console.log('Hall creation response:', createHallResponse.status, createHallResponse.data);

      if (createHallResponse.status === 201) {
        console.log('✅ Successfully created APEX Auditorium!');
        
        // Now test booking with the new hall
        console.log('\n3️⃣ Testing booking with new hall...');
        const bookingResponse = await makeRequest('/api/bookings', 'POST', {
          hallId: 'apex-auditorium',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          purpose: 'Test booking with new hall',
          attendees: 1,
          requirements: 'Time: 15:00 - 16:00'
        }, token);

        console.log('Booking test result:', bookingResponse.status, bookingResponse.data);
      }
    }

  } catch (error) {
    console.error('💥 Database check failed:', error.message);
  }
}

checkDatabase();

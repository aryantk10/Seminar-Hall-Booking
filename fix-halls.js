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
      timeout: 30000 // 30 second timeout
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

async function fixHalls() {
  console.log('🔧 Fixing Hall Database...\n');

  try {
    // Step 1: Populate halls using the endpoint
    console.log('1️⃣ Populating halls in database...');
    const populateResponse = await makeRequest('/api/halls/populate');
    
    console.log('Populate response status:', populateResponse.status);
    if (populateResponse.status === 200) {
      console.log('✅ Halls populated successfully!');
      console.log('Created halls:', populateResponse.data.halls?.length || 0);
      
      if (populateResponse.data.halls) {
        populateResponse.data.halls.forEach(hall => {
          console.log(`- ${hall.name} (ID: ${hall.id})`);
        });
      }
    } else {
      console.log('❌ Hall population failed:', populateResponse.data);
      return;
    }

    // Step 2: Verify halls exist
    console.log('\n2️⃣ Verifying halls in database...');
    const hallsResponse = await makeRequest('/api/halls');
    
    if (hallsResponse.status === 200) {
      console.log('✅ Halls verified!');
      console.log('Total halls in database:', hallsResponse.data.length);
      
      hallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (ID: ${hall._id})`);
      });
    }

    // Step 3: Test booking with new halls
    console.log('\n3️⃣ Testing booking with actual halls...');
    
    // Login first
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'aryantk1020@outlook.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');

      // Test booking with APEX Auditorium
      const bookingResponse = await makeRequest('/api/bookings', 'POST', {
        hallId: 'apex-auditorium',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        purpose: 'Testing with real halls',
        attendees: 1,
        requirements: 'Time: 16:00 - 17:00'
      }, token);

      console.log('Booking test result:', bookingResponse.status);
      if (bookingResponse.status === 201) {
        console.log('✅ Booking successful with real hall!');
        console.log('Hall used:', bookingResponse.data.hall?.name);
      } else {
        console.log('❌ Booking failed:', bookingResponse.data);
      }
    }

    console.log('\n🎉 Hall fix complete!');

  } catch (error) {
    console.error('💥 Hall fix failed:', error.message);
  }
}

fixHalls();

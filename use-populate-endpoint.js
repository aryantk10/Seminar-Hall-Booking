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

async function usePopulateEndpoint() {
  console.log('🏢 Using Populate Endpoint to Create Real Halls...\n');
  console.log('🎯 Target Database: MongoDB Atlas Cluster0');
  console.log('🔗 Backend: Render (seminar-hall-booking-backend.onrender.com)');
  console.log('🌐 Frontend: Vercel\n');

  try {
    // Step 1: Check current halls
    console.log('1️⃣ Checking current halls in database...');
    const currentHallsResponse = await makeRequest('/api/halls');
    
    if (currentHallsResponse.status === 200) {
      console.log('📋 Current halls in database:');
      currentHallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (Capacity: ${hall.capacity})`);
      });
    }

    // Step 2: Use populate endpoint (no auth required)
    console.log('\n2️⃣ Using populate endpoint to create real halls...');
    const populateResponse = await makeRequest('/api/halls/populate');
    
    console.log('Populate response status:', populateResponse.status);
    console.log('Populate response:', populateResponse.data);

    if (populateResponse.status === 200) {
      console.log('✅ Halls populated successfully!');
      
      if (populateResponse.data.halls) {
        console.log('📋 Created halls:');
        populateResponse.data.halls.forEach(hall => {
          console.log(`- ${hall.name} (Capacity: ${hall.capacity})`);
        });
      }
    } else {
      console.log('❌ Populate failed:', populateResponse.data);
      return;
    }

    // Step 3: Verify final state
    console.log('\n3️⃣ Verifying final database state...');
    const finalHallsResponse = await makeRequest('/api/halls');
    
    if (finalHallsResponse.status === 200) {
      console.log('✅ Final halls in database:');
      finalHallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (ID: ${hall._id}, Capacity: ${hall.capacity})`);
      });
      
      console.log(`\n📊 Total halls in database: ${finalHallsResponse.data.length}`);
    }

    // Step 4: Test booking with real hall
    console.log('\n4️⃣ Testing booking with real hall...');
    
    // Login first
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'aryantk1020@outlook.com',
      password: 'Timber2014*'
    });

    if (loginResponse.status === 200) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');

      // Test booking with APEX Auditorium
      const testBookingResponse = await makeRequest('/api/bookings', 'POST', {
        hallId: 'apex-auditorium',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        purpose: 'Testing with real APEX Auditorium',
        attendees: 1,
        requirements: 'Time: 18:00 - 19:00'
      }, token);

      if (testBookingResponse.status === 201) {
        console.log('🎉 SUCCESS! Booking created with real hall:');
        console.log(`- Hall: ${testBookingResponse.data.hall?.name}`);
        console.log(`- Booking ID: ${testBookingResponse.data._id}`);
        console.log(`- Purpose: ${testBookingResponse.data.purpose}`);
      } else {
        console.log('❌ Test booking failed:', testBookingResponse.data);
      }
    } else {
      console.log('❌ Login failed for booking test:', loginResponse.data);
    }

    console.log('\n🎉 Real halls setup complete!');
    console.log('🔄 Your app now uses actual institutional halls instead of "Test Hall"');
    console.log('📱 Try creating a booking in your frontend - it should now show the real hall name!');

  } catch (error) {
    console.error('💥 Setup failed:', error.message);
  }
}

usePopulateEndpoint();

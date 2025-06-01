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

async function testBookingFix() {
  console.log('🧪 Testing booking fix...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@admin.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test booking creation
    console.log('\n2️⃣ Testing booking creation...');
    const bookingData = {
      hallId: 'apex-auditorium',  // This should now map to "Test Hall"
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      purpose: 'Testing the booking fix',
      attendees: 1,
      requirements: 'Time: 14:00 - 15:00'
    };

    console.log('📤 Sending booking data:', bookingData);

    const bookingResponse = await makeRequest('/api/bookings', 'POST', bookingData, token);
    
    console.log('📥 Booking response:');
    console.log('Status:', bookingResponse.status);
    console.log('Data:', bookingResponse.data);

    if (bookingResponse.status === 201) {
      console.log('\n🎉 BOOKING SUCCESSFUL! The fix worked!');
    } else if (bookingResponse.status === 404) {
      console.log('\n❌ Still getting 404 - deployment may not be complete yet');
    } else {
      console.log('\n⚠️ Different error:', bookingResponse.data.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBookingFix();

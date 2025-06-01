const https = require('https');

const API_URL = 'https://seminar-hall-booking-backend.onrender.com';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'seminar-hall-booking-backend.onrender.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testServer() {
  console.log('🧪 Testing which server is running...\n');

  try {
    // Test root endpoint
    console.log('1️⃣ Testing root endpoint...');
    const rootResponse = await makeRequest('/');
    console.log('Root response:', rootResponse);

    // Test API endpoint
    console.log('\n2️⃣ Testing /api endpoint...');
    const apiResponse = await makeRequest('/api');
    console.log('API response:', apiResponse);

    // Test booking endpoint (should fail if simple server)
    console.log('\n3️⃣ Testing /api/bookings endpoint...');
    try {
      const bookingResponse = await makeRequest('/api/bookings');
      console.log('Booking response:', bookingResponse);
    } catch (error) {
      console.log('Booking endpoint error:', error.message);
    }

    // Test halls endpoint
    console.log('\n4️⃣ Testing /api/halls endpoint...');
    try {
      const hallsResponse = await makeRequest('/api/halls');
      console.log('Halls response:', hallsResponse);
    } catch (error) {
      console.log('Halls endpoint error:', error.message);
    }

    // Test auth endpoint
    console.log('\n5️⃣ Testing /api/auth endpoint...');
    try {
      const authResponse = await makeRequest('/api/auth');
      console.log('Auth response:', authResponse);
    } catch (error) {
      console.log('Auth endpoint error:', error.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testServer();

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
      timeout: 10000 // 10 second timeout
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

async function debugMyBookings() {
  console.log('🔍 Debugging My Bookings...\n');

  try {
    // Quick login test
    console.log('1️⃣ Quick login test...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@admin.com',
      password: 'password123'
    });

    console.log('Login status:', loginResponse.status);
    if (loginResponse.status === 200) {
      const token = loginResponse.data.token;
      const userId = loginResponse.data.user.id;
      console.log('✅ Login OK, User ID:', userId);

      // Test my bookings endpoint
      console.log('\n2️⃣ Testing my bookings...');
      try {
        const myBookingsResponse = await makeRequest('/api/bookings/my', 'GET', null, token);
        console.log('My bookings status:', myBookingsResponse.status);
        console.log('My bookings data:', myBookingsResponse.data);
      } catch (error) {
        console.log('❌ My bookings failed:', error.message);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugMyBookings();

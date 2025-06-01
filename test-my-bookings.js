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

async function testMyBookings() {
  console.log('🧪 Testing My Bookings API...\n');

  try {
    // Step 1: Login
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
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('👤 User info:', { id: user.id, name: user.name, email: user.email });

    // Step 2: Test My Bookings endpoint
    console.log('\n2️⃣ Testing /api/bookings/my endpoint...');
    const myBookingsResponse = await makeRequest('/api/bookings/my', 'GET', null, token);
    
    console.log('📥 My Bookings response:');
    console.log('Status:', myBookingsResponse.status);
    console.log('Data:', JSON.stringify(myBookingsResponse.data, null, 2));
    console.log('Number of bookings:', myBookingsResponse.data?.length || 0);

    if (myBookingsResponse.data && myBookingsResponse.data.length > 0) {
      console.log('\n📋 Booking details:');
      myBookingsResponse.data.forEach((booking, index) => {
        console.log(`${index + 1}. Booking ID: ${booking._id}`);
        console.log(`   User ID: ${booking.user}`);
        console.log(`   Hall: ${booking.hall?.name || booking.hall}`);
        console.log(`   Purpose: ${booking.purpose}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      });
    }

    // Step 3: Test All Bookings endpoint (admin)
    console.log('\n3️⃣ Testing /api/bookings endpoint (all bookings)...');
    const allBookingsResponse = await makeRequest('/api/bookings', 'GET', null, token);
    
    console.log('📥 All Bookings response:');
    console.log('Status:', allBookingsResponse.status);
    console.log('Number of bookings:', allBookingsResponse.data?.length || 0);

    if (allBookingsResponse.data && allBookingsResponse.data.length > 0) {
      console.log('\n📋 All bookings:');
      allBookingsResponse.data.forEach((booking, index) => {
        console.log(`${index + 1}. Booking ID: ${booking._id}`);
        console.log(`   User: ${booking.user?.name || booking.user} (${booking.user?.email || 'no email'})`);
        console.log(`   User ID: ${booking.user?._id || booking.user}`);
        console.log(`   Hall: ${booking.hall?.name || booking.hall}`);
        console.log(`   Purpose: ${booking.purpose}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      });

      // Check if any bookings belong to current user
      const userBookings = allBookingsResponse.data.filter(booking => 
        booking.user?._id === user.id || booking.user === user.id
      );
      console.log(`🔍 Bookings for current user (${user.id}):`, userBookings.length);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testMyBookings();

const fetch = require('node-fetch');

const API_URL = 'https://seminar-hall-booking-backend.onrender.com/api';

async function testBookingFlow() {
  try {
    console.log('🧪 Testing Booking Flow...\n');

    // Step 1: Check if halls exist
    console.log('1️⃣ Checking available halls...');
    const hallsResponse = await fetch(`${API_URL}/halls`);
    const halls = await hallsResponse.json();
    console.log('📋 Available halls:', halls.map(h => ({ id: h._id, name: h.name })));

    if (halls.length === 0) {
      console.log('⚠️ No halls found! Populating halls...');
      const populateResponse = await fetch(`${API_URL}/halls/populate`);
      const populateResult = await populateResponse.json();
      console.log('✅ Halls populated:', populateResult);
    }

    // Step 2: Test login (faculty)
    console.log('\n2️⃣ Testing faculty login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'faculty@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('⚠️ Faculty login failed, creating test faculty...');
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Faculty',
          email: 'faculty@test.com',
          password: 'password123',
          role: 'faculty'
        })
      });
      const registerResult = await registerResponse.json();
      console.log('👤 Faculty created:', registerResult);

      // Try login again
      const retryLoginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'faculty@test.com',
          password: 'password123'
        })
      });
      const loginResult = await retryLoginResponse.json();
      console.log('🔐 Faculty login successful:', { token: loginResult.token ? 'EXISTS' : 'MISSING' });
      var token = loginResult.token;
    } else {
      const loginResult = await loginResponse.json();
      console.log('🔐 Faculty login successful:', { token: loginResult.token ? 'EXISTS' : 'MISSING' });
      var token = loginResult.token;
    }

    // Step 3: Test booking creation
    console.log('\n3️⃣ Testing booking creation...');
    const bookingData = {
      hallId: 'apex-auditorium',  // Frontend hall ID
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      purpose: 'Test booking from script',
      attendees: 1,
      requirements: 'Time: 10:00 - 11:00'
    };

    console.log('📤 Sending booking data:', bookingData);

    const bookingResponse = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });

    const bookingResult = await bookingResponse.json();
    console.log('📥 Booking response:', {
      status: bookingResponse.status,
      success: bookingResponse.ok,
      data: bookingResult
    });

    if (bookingResponse.ok) {
      console.log('🎉 BOOKING SUCCESSFUL!');
    } else {
      console.log('❌ BOOKING FAILED:', bookingResult.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBookingFlow();

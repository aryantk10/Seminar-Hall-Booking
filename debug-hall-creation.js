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

async function debugHallCreation() {
  console.log('🔍 Debugging Hall Creation Issue...\n');

  try {
    // Login first
    console.log('1️⃣ Admin Login...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@test.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    const adminToken = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test with minimal required data
    console.log('\n2️⃣ Testing minimal hall creation...');
    const minimalHallData = {
      name: 'Debug Test Hall',
      capacity: 50,
      location: 'Test Location'
    };

    console.log('📤 Sending data:', minimalHallData);
    const createResponse = await makeRequest('/api/halls', 'POST', minimalHallData, adminToken);
    
    console.log('📥 Response status:', createResponse.status);
    console.log('📥 Response data:', createResponse.data);

    if (createResponse.status === 201) {
      console.log('✅ Minimal hall creation successful');
      
      // Try to delete it
      const hall = createResponse.data.hall || createResponse.data;
      const hallId = hall._id || hall.id;
      
      if (hallId) {
        console.log('\n3️⃣ Cleaning up test hall...');
        const deleteResponse = await makeRequest(`/api/halls/${hallId}`, 'DELETE', null, adminToken);
        console.log('🗑️ Delete response:', deleteResponse.status, deleteResponse.data);
      }
      
    } else {
      console.log('❌ Hall creation failed');
      
      // Test with more complete data
      console.log('\n🔄 Trying with complete data...');
      const completeHallData = {
        name: 'Debug Test Hall Complete',
        capacity: 50,
        location: 'Test Location',
        description: 'Test description',
        image: '/images/halls/default-hall.jpg',
        block: 'Main Building',
        type: 'Meeting Room',
        amenities: ['Projector', 'Wi-Fi']
      };

      console.log('📤 Sending complete data:', completeHallData);
      const completeResponse = await makeRequest('/api/halls', 'POST', completeHallData, adminToken);
      
      console.log('📥 Complete response status:', completeResponse.status);
      console.log('📥 Complete response data:', completeResponse.data);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugHallCreation();

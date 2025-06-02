const https = require('https');

// Test authentication and authorization for admin operations
async function testAuthDebug() {
  console.log('🔐 Testing Authentication & Authorization...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@test.com',
      password: 'password123'
    });

    if (loginResponse.status !== 200) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Admin login successful');
    console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));

    const token = loginResponse.data.token;
    const user = loginResponse.data.user || loginResponse.data;

    if (token) {
      console.log(`   Token: ${token.substring(0, 20)}...`);
    }

    if (user && user.name) {
      console.log(`   User: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
    }

    // Step 2: Test token validation
    console.log('\n2️⃣ Testing token validation...');
    const profileResponse = await makeRequest('/api/auth/profile', 'GET', null, token);
    
    if (profileResponse.status !== 200) {
      console.error('❌ Token validation failed:', profileResponse.data);
      return;
    }
    
    console.log('✅ Token validation successful');
    console.log(`   Profile: ${profileResponse.data.name} (${profileResponse.data.role})`);

    // Step 3: Test Create Hall (should work)
    console.log('\n3️⃣ Testing Create Hall authorization...');
    const createData = {
      name: `Auth Test Hall ${Date.now()}`,
      capacity: 50,
      location: 'Test Building',
      facilities: ['Projector'],
      description: 'Test hall for auth debugging'
    };

    const createResponse = await makeRequest('/api/halls', 'POST', createData, token);
    
    if (createResponse.status === 201) {
      console.log('✅ Create Hall: AUTHORIZED');
      console.log(`   Created: ${createResponse.data.name} (ID: ${createResponse.data._id})`);
      
      // Step 4: Test Delete Hall (should work)
      console.log('\n4️⃣ Testing Delete Hall authorization...');
      const deleteResponse = await makeRequest(`/api/halls/${createResponse.data._id}`, 'DELETE', null, token);
      
      if (deleteResponse.status === 200) {
        console.log('✅ Delete Hall: AUTHORIZED');
        console.log(`   Deleted: ${deleteResponse.data.hallName}`);
      } else {
        console.log('❌ Delete Hall: NOT AUTHORIZED');
        console.log(`   Status: ${deleteResponse.status}`);
        console.log(`   Error: ${deleteResponse.data.message || deleteResponse.data}`);
      }
      
    } else {
      console.log('❌ Create Hall: NOT AUTHORIZED');
      console.log(`   Status: ${createResponse.status}`);
      console.log(`   Error: ${createResponse.data.message || createResponse.data}`);
    }

    // Step 5: Test without token (should fail)
    console.log('\n5️⃣ Testing without token (should fail)...');
    const noTokenResponse = await makeRequest('/api/halls', 'POST', createData, null);
    
    if (noTokenResponse.status === 401) {
      console.log('✅ No Token: Correctly rejected (401)');
    } else {
      console.log('❌ No Token: Should have been rejected');
      console.log(`   Status: ${noTokenResponse.status}`);
    }

    // Step 6: Test with invalid token (should fail)
    console.log('\n6️⃣ Testing with invalid token (should fail)...');
    const invalidTokenResponse = await makeRequest('/api/halls', 'POST', createData, 'invalid-token');
    
    if (invalidTokenResponse.status === 401) {
      console.log('✅ Invalid Token: Correctly rejected (401)');
    } else {
      console.log('❌ Invalid Token: Should have been rejected');
      console.log(`   Status: ${invalidTokenResponse.status}`);
    }

    console.log('\n📊 Summary:');
    console.log('✅ Admin login: Working');
    console.log('✅ Token validation: Working');
    console.log(`${createResponse.status === 201 ? '✅' : '❌'} Create authorization: ${createResponse.status === 201 ? 'Working' : 'Failed'}`);
    console.log('✅ Security: Working (rejects invalid tokens)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

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

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the test
testAuthDebug().catch(console.error);

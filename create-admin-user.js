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

async function createAdminUser() {
  console.log('👑 Creating Admin User for Testing...\n');

  try {
    // Try to register an admin user
    console.log('1️⃣ Attempting to register admin user...');
    const adminData = {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin'
    };

    const registerResponse = await makeRequest('/api/auth/register', 'POST', adminData);
    
    if (registerResponse.status === 201) {
      console.log('✅ Admin user created successfully');
      console.log(`👤 Name: ${registerResponse.data.user?.name}`);
      console.log(`📧 Email: ${registerResponse.data.user?.email}`);
      console.log(`🔑 Role: ${registerResponse.data.user?.role}`);
      
      // Test login with new admin
      console.log('\n2️⃣ Testing admin login...');
      const loginResponse = await makeRequest('/api/auth/login', 'POST', {
        email: 'admin@test.com',
        password: 'Admin123!'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Admin login successful');
        console.log(`🎯 Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
        console.log(`👑 Role confirmed: ${loginResponse.data.user?.role || loginResponse.data.role}`);
        
        console.log('\n🎉 Admin user ready for testing!');
        console.log('📝 Admin Credentials:');
        console.log('   Email: admin@test.com');
        console.log('   Password: Admin123!');
        
      } else {
        console.log('❌ Admin login failed:', loginResponse.data);
      }
      
    } else if (registerResponse.status === 400 && registerResponse.data.message?.includes('already exists')) {
      console.log('ℹ️ Admin user already exists, testing login...');
      
      const loginResponse = await makeRequest('/api/auth/login', 'POST', {
        email: 'admin@test.com',
        password: 'Admin123!'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Existing admin login successful');
        console.log(`👑 Role: ${loginResponse.data.user?.role || loginResponse.data.role}`);
      } else {
        console.log('❌ Existing admin login failed:', loginResponse.data);
      }
      
    } else {
      console.log('❌ Admin registration failed:', registerResponse.data);
      
      // Try alternative admin registration endpoint
      console.log('\n🔄 Trying alternative admin registration...');
      const altResponse = await makeRequest('/api/auth/register/admin', 'POST', adminData);
      
      if (altResponse.status === 201) {
        console.log('✅ Admin user created via admin endpoint');
      } else {
        console.log('❌ Alternative admin registration also failed:', altResponse.data);
      }
    }

  } catch (error) {
    console.error('💥 Error creating admin user:', error.message);
  }
}

createAdminUser();

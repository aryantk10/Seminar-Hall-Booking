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

async function debugAdminAccess() {
  console.log('🔍 Debugging Admin Access Issues...\n');

  try {
    // Test admin login
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@test.com',
      password: 'password123'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Admin login successful');
      const user = loginResponse.data.user || loginResponse.data;
      console.log(`👤 User: ${user.name || 'Unknown'}`);
      console.log(`📧 Email: ${user.email || 'Unknown'}`);
      console.log(`🔑 Role: ${user.role || 'Unknown'}`);
      console.log(`🎫 Token: ${loginResponse.data.token ? 'Present' : 'Missing'}`);
      
      if (user.role !== 'admin') {
        console.log('❌ ISSUE FOUND: User role is not admin!');
        console.log('   This explains why admin features are not visible');
        return;
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data);
      return;
    }

    // Test your regular user
    console.log('\n2️⃣ Testing your regular user...');
    const userLoginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'aryantk1020@outlook.com',
      password: 'Timber2014*'
    });

    if (userLoginResponse.status === 200) {
      console.log('✅ Regular user login successful');
      const user = userLoginResponse.data.user || userLoginResponse.data;
      console.log(`👤 User: ${user.name || 'Unknown'}`);
      console.log(`📧 Email: ${user.email || 'Unknown'}`);
      console.log(`🔑 Role: ${user.role || 'Unknown'}`);
      
      if (user.role === 'admin') {
        console.log('✅ GOOD: Your regular user has admin role!');
        console.log('   You should be able to see admin features');
      } else {
        console.log('❌ ISSUE: Your regular user is not admin');
        console.log('   This is why you cannot see admin features');
      }
      
    } else {
      console.log('❌ Regular user login failed:', userLoginResponse.data);
    }

    console.log('\n📋 TROUBLESHOOTING GUIDE:');
    console.log('If your user is not admin:');
    console.log('1. Use admin@test.com / password123 to access admin features');
    console.log('2. Or we need to update your user role to admin in database');
    console.log('3. Check browser localStorage for stored user data');
    console.log('4. Clear browser cache and login again');

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

debugAdminAccess();

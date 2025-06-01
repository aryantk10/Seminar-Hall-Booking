const https = require('https');

function makeRequest(path, method = 'GET', data = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };

    const options = {
      hostname: 'seminar-hall-booking-backend.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: headers,
      timeout: timeout
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed, raw: responseData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, raw: responseData });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
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

async function checkBackendStatus() {
  console.log('🔍 Checking Backend Status...\n');
  console.log('🎯 Target: https://seminar-hall-booking-backend.onrender.com\n');

  const tests = [
    { name: 'Root Endpoint', path: '/', timeout: 5000 },
    { name: 'API Health', path: '/api', timeout: 5000 },
    { name: 'Halls Endpoint', path: '/api/halls', timeout: 10000 },
    { name: 'Auth Test', path: '/api/auth/test', timeout: 5000 }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name} (${test.path})`);
      const startTime = Date.now();
      
      const result = await makeRequest(test.path, 'GET', null, test.timeout);
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${test.name}: ${result.status} (${duration}ms)`);
      
      if (result.status === 200) {
        if (typeof result.data === 'object') {
          console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        } else {
          console.log(`   Response: ${result.data.substring(0, 100)}...`);
        }
      } else {
        console.log(`   Error: ${result.data}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      
      if (error.message.includes('timeout')) {
        console.log('   → Backend may be cold starting (normal on Render free tier)');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('   → DNS resolution failed - check internet connection');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('   → Connection refused - backend may be down');
      }
    }
    
    console.log(''); // Empty line for readability
  }

  // Test login specifically
  console.log('🔐 Testing Login Endpoint...');
  try {
    const loginResult = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'test123'
    }, 15000);
    
    console.log(`✅ Login endpoint: ${loginResult.status}`);
    if (loginResult.status === 400 || loginResult.status === 401) {
      console.log('   → Login endpoint is working (expected auth failure)');
    } else if (loginResult.status === 500) {
      console.log('   → Server error - backend may have issues');
    }
    
  } catch (error) {
    console.log(`❌ Login test: ${error.message}`);
  }

  console.log('\n📊 Diagnosis:');
  console.log('If you see timeouts or connection errors:');
  console.log('1. 🕐 Wait 2-3 minutes for Render to wake up the backend');
  console.log('2. 🔄 Try refreshing your frontend login page');
  console.log('3. 🌐 Check if https://seminar-hall-booking-backend.onrender.com works in browser');
  console.log('4. 📱 Check Render dashboard for deployment status');
  
  console.log('\nIf backend is responding but login fails:');
  console.log('1. 🔍 Check frontend API URL configuration');
  console.log('2. 🔐 Verify user credentials exist in database');
  console.log('3. 🛠️ Check browser network tab for detailed error messages');
}

checkBackendStatus();

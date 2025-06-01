const https = require('https');

function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testFrontendAdmin() {
  console.log('🔍 Testing Frontend Admin Page Deployment...\n');

  try {
    // Test if admin halls page is accessible
    console.log('1️⃣ Testing admin halls page accessibility...');
    const response = await makeHttpRequest('https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls');
    
    console.log(`📊 Status Code: ${response.status}`);
    console.log(`📦 Content-Type: ${response.headers['content-type']}`);
    
    if (response.status === 200) {
      console.log('✅ Admin halls page is accessible');
      
      // Check if the page contains expected admin elements
      const body = response.body;
      const checks = [
        { name: 'Add New Hall button', pattern: /Add New Hall/i },
        { name: 'Hall Management title', pattern: /Hall Management/i },
        { name: 'Admin Panel text', pattern: /Admin Panel/i },
        { name: 'Edit button', pattern: /Edit/i },
        { name: 'Delete button', pattern: /Delete/i },
        { name: 'Create New Hall dialog', pattern: /Create New Hall/i }
      ];
      
      console.log('\n🔍 Checking for admin UI elements:');
      checks.forEach(check => {
        if (check.pattern.test(body)) {
          console.log(`✅ ${check.name}: Found`);
        } else {
          console.log(`❌ ${check.name}: Missing`);
        }
      });
      
      // Check for JavaScript errors or build issues
      if (body.includes('Application error') || body.includes('500') || body.includes('404')) {
        console.log('❌ Page contains error messages');
      } else {
        console.log('✅ No obvious error messages found');
      }
      
    } else {
      console.log(`❌ Admin halls page returned status: ${response.status}`);
    }

    // Test main dashboard
    console.log('\n2️⃣ Testing main dashboard...');
    const dashboardResponse = await makeHttpRequest('https://seminar-hall-booking-j69q.onrender.com/dashboard');
    console.log(`📊 Dashboard Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Main dashboard accessible');
    } else {
      console.log('❌ Main dashboard has issues');
    }

    // Test if the deployment is recent
    console.log('\n3️⃣ Checking deployment freshness...');
    const lastModified = response.headers['last-modified'];
    if (lastModified) {
      const deployTime = new Date(lastModified);
      const now = new Date();
      const timeDiff = (now - deployTime) / (1000 * 60); // minutes
      
      console.log(`📅 Last Modified: ${deployTime.toISOString()}`);
      console.log(`⏰ Time since deployment: ${Math.round(timeDiff)} minutes ago`);
      
      if (timeDiff < 30) {
        console.log('✅ Recent deployment detected');
      } else {
        console.log('⚠️ Deployment might be stale');
      }
    }

    console.log('\n📋 TROUBLESHOOTING STEPS:');
    console.log('1. Clear browser cache and hard refresh (Ctrl+Shift+R)');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify you are logged in as admin (admin@test.com)');
    console.log('4. Try accessing: https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls');
    console.log('5. Check if Vercel deployment completed successfully');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testFrontendAdmin();

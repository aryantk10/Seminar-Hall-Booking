const https = require('https');

function testPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testAfterRedeploy() {
  console.log('🔍 Testing After Vercel Redeploy...\n');
  
  try {
    // Test admin halls page
    console.log('1️⃣ Testing admin halls page...');
    const adminResponse = await testPage('https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls');
    
    console.log(`📊 Status: ${adminResponse.status}`);
    console.log(`📦 Content-Type: ${adminResponse.headers['content-type']}`);
    
    // Check for admin UI elements
    const adminChecks = [
      'Add New Hall',
      'Hall Management', 
      'Admin Panel',
      'Edit hall details',
      'Delete hall',
      'Create New Hall'
    ];
    
    console.log('\n🔍 Admin UI Elements:');
    let adminFound = 0;
    adminChecks.forEach(check => {
      const found = adminResponse.body.includes(check);
      console.log(`${found ? '✅' : '❌'} ${check}`);
      if (found) adminFound++;
    });
    
    // Test main dashboard for comparison
    console.log('\n2️⃣ Testing main dashboard...');
    const dashResponse = await testPage('https://seminar-hall-booking-psi.vercel.app/dashboard');
    console.log(`📊 Dashboard Status: ${dashResponse.status}`);
    
    // Check if it's a routing/auth issue
    console.log('\n3️⃣ Checking for auth/routing issues...');
    const authChecks = [
      { name: 'Login redirect', pattern: /login/i },
      { name: 'Authentication required', pattern: /auth/i },
      { name: 'Unauthorized', pattern: /unauthorized/i },
      { name: 'Not found', pattern: /404|not found/i },
      { name: 'Error page', pattern: /error|500/i }
    ];
    
    authChecks.forEach(check => {
      const found = check.pattern.test(adminResponse.body);
      if (found) {
        console.log(`⚠️ ${check.name}: Detected`);
      }
    });
    
    // Final assessment
    console.log('\n📊 RESULTS:');
    console.log(`Admin UI Elements Found: ${adminFound}/${adminChecks.length}`);
    
    if (adminFound >= 3) {
      console.log('🎉 SUCCESS! Admin UI is working!');
      console.log('✅ Redeploy was successful');
    } else if (adminFound >= 1) {
      console.log('🟡 PARTIAL SUCCESS - Some elements found');
      console.log('⏳ May need a few more minutes to fully deploy');
    } else {
      console.log('❌ ADMIN UI STILL NOT VISIBLE');
      console.log('🔍 Possible issues:');
      console.log('   1. Need to be logged in as admin first');
      console.log('   2. Page is redirecting to login');
      console.log('   3. Deployment still processing');
      console.log('   4. Browser cache needs clearing');
    }
    
    // Show a snippet of what's actually on the page
    console.log('\n📄 Page Content Preview:');
    const preview = adminResponse.body.substring(0, 500).replace(/\s+/g, ' ').trim();
    console.log(preview + '...');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testAfterRedeploy();

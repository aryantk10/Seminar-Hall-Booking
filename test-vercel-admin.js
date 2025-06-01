const https = require('https');

function testVercelAdmin() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function checkVercelDeployment() {
  console.log('🔍 Testing CORRECT Vercel URL: https://seminar-hall-booking-psi.vercel.app/\n');
  
  try {
    const response = await testVercelAdmin();
    
    console.log(`📊 Status: ${response.status}`);
    
    // Check for key admin UI elements
    const checks = [
      { name: 'Updated text', pattern: /Admin Panel \(Updated\)/i },
      { name: 'Add New Hall button', pattern: /Add New Hall/i },
      { name: 'Hall Management title', pattern: /Hall Management/i },
      { name: 'Edit tooltip', pattern: /Edit hall details/i },
      { name: 'Delete tooltip', pattern: /Delete hall/i },
      { name: 'Create dialog', pattern: /Create New Hall/i },
      { name: 'Admin Panel text', pattern: /Admin Panel/i },
      { name: 'Statistics cards', pattern: /Total Halls/i }
    ];
    
    console.log('🔍 Admin UI Elements Check:');
    let foundCount = 0;
    
    checks.forEach(check => {
      const found = check.pattern.test(response.body);
      console.log(`${found ? '✅' : '❌'} ${check.name}`);
      if (found) foundCount++;
    });
    
    console.log(`\n📊 Score: ${foundCount}/${checks.length} elements found`);
    
    if (foundCount >= 5) {
      console.log('\n🎉 SUCCESS! Admin UI is working on Vercel!');
      console.log('✅ Deployment completed successfully');
      console.log('🔗 Admin can now:');
      console.log('   1. Login as admin (admin@test.com / password123)');
      console.log('   2. Visit: https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls');
      console.log('   3. Click "Add New Hall" to create halls');
      console.log('   4. Use Edit/Delete buttons on hall cards');
    } else if (foundCount >= 2) {
      console.log('\n🟡 PARTIAL SUCCESS');
      console.log('⏳ Some elements found, deployment might still be processing');
    } else {
      console.log('\n❌ ADMIN UI STILL NOT VISIBLE');
      console.log('🔍 Possible issues:');
      console.log('   1. Need to login as admin first');
      console.log('   2. Vercel deployment still in progress');
      console.log('   3. Browser cache needs clearing');
    }
    
    // Check if it's a login redirect
    if (response.body.includes('login') || response.body.includes('Login')) {
      console.log('\n💡 TIP: Page might be redirecting to login');
      console.log('   Make sure you are logged in as admin first');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

checkVercelDeployment();

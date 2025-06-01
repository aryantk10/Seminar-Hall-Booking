const https = require('https');

function quickCheck() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls', (res) => {
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

async function checkNow() {
  console.log('🔍 Quick Check: Is Admin UI Working Now?\n');
  
  try {
    const response = await quickCheck();
    
    console.log(`📊 Status: ${response.status}`);
    
    // Check for key admin UI elements
    const checks = [
      { name: 'Updated text', pattern: /Admin Panel \(Updated\)/i, found: false },
      { name: 'Add New Hall button', pattern: /Add New Hall/i, found: false },
      { name: 'Hall Management title', pattern: /Hall Management/i, found: false },
      { name: 'Edit button', pattern: /Edit hall details/i, found: false },
      { name: 'Delete button', pattern: /Delete hall/i, found: false },
      { name: 'Create dialog', pattern: /Create New Hall/i, found: false }
    ];
    
    checks.forEach(check => {
      check.found = check.pattern.test(response.body);
    });
    
    console.log('🔍 Admin UI Elements Check:');
    checks.forEach(check => {
      console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
    });
    
    const foundCount = checks.filter(c => c.found).length;
    const totalCount = checks.length;
    
    console.log(`\n📊 Score: ${foundCount}/${totalCount} elements found`);
    
    if (foundCount >= 4) {
      console.log('\n🎉 SUCCESS! Admin UI is working!');
      console.log('✅ Vercel deployment completed successfully');
      console.log('🔗 Try logging in as admin and visiting:');
      console.log('   https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls');
    } else if (foundCount >= 2) {
      console.log('\n🟡 PARTIAL SUCCESS - Some elements found');
      console.log('⏳ Deployment might still be in progress');
    } else {
      console.log('\n❌ STILL NOT WORKING');
      console.log('⏳ Vercel deployment may still be processing');
      console.log('💡 Try again in a few minutes');
    }
    
  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkNow();

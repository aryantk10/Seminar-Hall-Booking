const https = require('https');

function checkDeployment() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          timestamp: new Date().toISOString()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function monitorDeployment() {
  console.log('🔍 Monitoring Vercel Deployment Status...\n');
  
  let attempt = 1;
  const maxAttempts = 10;
  
  while (attempt <= maxAttempts) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
      
      const response = await checkDeployment();
      
      // Check for our updated text that indicates new deployment
      const hasUpdatedText = response.body.includes('Admin Panel (Updated)');
      const hasAddButton = response.body.includes('Add New Hall');
      const hasHallManagement = response.body.includes('Hall Management');
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`🔄 Updated text present: ${hasUpdatedText ? '✅' : '❌'}`);
      console.log(`🔘 Add New Hall button: ${hasAddButton ? '✅' : '❌'}`);
      console.log(`📋 Hall Management title: ${hasHallManagement ? '✅' : '❌'}`);
      
      if (hasUpdatedText && hasAddButton && hasHallManagement) {
        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        console.log('✅ New version is live with admin UI');
        console.log('🔗 You can now test: https://seminar-hall-booking-j69q.onrender.com/dashboard/admin/halls');
        return;
      } else if (hasUpdatedText) {
        console.log('\n🟡 PARTIAL DEPLOYMENT');
        console.log('⚠️ Updated text found but admin UI still missing');
      } else {
        console.log('\n🟡 OLD VERSION STILL ACTIVE');
        console.log('⏳ Waiting for deployment to complete...');
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    if (attempt < maxAttempts) {
      console.log('⏰ Waiting 30 seconds before next check...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    attempt++;
  }
  
  console.log('\n⏰ Monitoring timeout reached');
  console.log('💡 Check Vercel dashboard manually or try again later');
}

monitorDeployment();

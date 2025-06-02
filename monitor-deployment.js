const https = require('https');

// Monitor deployment status for both Vercel and Render
async function monitorDeployment() {
  console.log('🚀 Monitoring CI/CD Pipeline & Deployment Status...\n');
  
  let attempt = 1;
  const maxAttempts = 15;
  
  while (attempt <= maxAttempts) {
    console.log(`📡 Check ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
    console.log('=' .repeat(60));
    
    try {
      // Check Vercel Frontend
      console.log('🔍 Checking Vercel Frontend...');
      const frontendResponse = await checkEndpoint('https://seminar-hall-booking-psi.vercel.app/dashboard/halls');
      
      const hasRealData = frontendResponse.body.includes('Live data from database');
      const hasManageButton = frontendResponse.body.includes('Manage Halls');
      const hasHallManagement = frontendResponse.body.includes('Hall Management');
      
      console.log(`   Status: ${frontendResponse.status}`);
      console.log(`   Real data indicator: ${hasRealData ? '✅' : '❌'}`);
      console.log(`   Manage Halls button: ${hasManageButton ? '✅' : '❌'}`);
      console.log(`   Updated navigation: ${hasHallManagement ? '✅' : '❌'}`);
      
      // Check Render Backend
      console.log('\n🔍 Checking Render Backend...');
      const backendResponse = await checkEndpoint('https://seminar-hall-booking-backend.onrender.com/api/halls');
      
      let hallsCount = 0;
      try {
        const halls = JSON.parse(backendResponse.body);
        hallsCount = Array.isArray(halls) ? halls.length : 0;
      } catch (e) {
        console.log('   Could not parse halls data');
      }
      
      console.log(`   Status: ${backendResponse.status}`);
      console.log(`   Halls available: ${hallsCount} halls`);
      console.log(`   Backend health: ${backendResponse.status === 200 ? '✅' : '❌'}`);
      
      // Check Admin CRUD endpoint
      console.log('\n🔍 Checking Admin CRUD Access...');
      const adminResponse = await checkEndpoint('https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls');
      
      const hasCreateButton = adminResponse.body.includes('Add New Hall');
      const hasEditButtons = adminResponse.body.includes('Edit');
      const hasDeleteButtons = adminResponse.body.includes('Delete');
      const hasAdminUI = adminResponse.body.includes('ADMIN UI WORKING');
      
      console.log(`   Status: ${adminResponse.status}`);
      console.log(`   Create functionality: ${hasCreateButton ? '✅' : '❌'}`);
      console.log(`   Edit functionality: ${hasEditButtons ? '✅' : '❌'}`);
      console.log(`   Delete functionality: ${hasDeleteButtons ? '✅' : '❌'}`);
      console.log(`   Admin UI loaded: ${hasAdminUI ? '✅' : '❌'}`);
      
      // Overall status
      const frontendReady = hasRealData && hasManageButton;
      const backendReady = backendResponse.status === 200 && hallsCount > 0;
      const adminReady = hasCreateButton && hasEditButtons && hasDeleteButtons;
      
      console.log('\n📊 Overall Status:');
      console.log(`   Frontend: ${frontendReady ? '✅ Ready' : '⏳ Deploying'}`);
      console.log(`   Backend: ${backendReady ? '✅ Ready' : '⏳ Starting'}`);
      console.log(`   Admin CRUD: ${adminReady ? '✅ Ready' : '⏳ Deploying'}`);
      
      if (frontendReady && backendReady && adminReady) {
        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        console.log('✅ All services are operational');
        console.log('✅ Admin CRUD functionality is live');
        console.log('✅ Real database integration working');
        console.log('\n🔗 Test URLs:');
        console.log('   • Frontend: https://seminar-hall-booking-psi.vercel.app/dashboard/halls');
        console.log('   • Admin Panel: https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls');
        console.log('   • Backend API: https://seminar-hall-booking-backend.onrender.com/api/halls');
        console.log('\n🎯 Ready for testing!');
        return;
      }
      
    } catch (error) {
      console.log(`❌ Check failed: ${error.message}`);
    }
    
    if (attempt < maxAttempts) {
      console.log('\n⏰ Waiting 45 seconds before next check...\n');
      await new Promise(resolve => setTimeout(resolve, 45000));
    }
    
    attempt++;
  }
  
  console.log('\n⚠️ Monitoring completed. Some services may still be deploying.');
  console.log('Check manually at:');
  console.log('• https://seminar-hall-booking-psi.vercel.app/dashboard/admin/halls');
  console.log('• https://dashboard.render.com (for backend status)');
}

function checkEndpoint(url) {
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
          timestamp: new Date().toISOString()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Start monitoring
monitorDeployment().catch(console.error);

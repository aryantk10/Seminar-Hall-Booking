const https = require('https');

console.log('🔍 Quick Backend Test...');
console.log('⏰ Testing backend connectivity...\n');

// Simple ping test
const options = {
  hostname: 'seminar-hall-booking-backend.onrender.com',
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 30000 // 30 second timeout
};

const req = https.request(options, (res) => {
  console.log(`✅ Backend responded: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📥 Response received');
    console.log('🎯 Backend is accessible!');
    
    if (res.statusCode === 200) {
      console.log('\n✅ BACKEND IS WORKING');
      console.log('💡 The login issue might be:');
      console.log('1. Frontend API URL configuration');
      console.log('2. CORS settings');
      console.log('3. User credentials');
      console.log('\n🔧 Try these steps:');
      console.log('1. Clear browser cache and cookies');
      console.log('2. Check browser console for detailed errors');
      console.log('3. Try registering a new user first');
    }
  });
});

req.on('timeout', () => {
  console.log('⏰ Request timed out after 30 seconds');
  console.log('🔄 Backend is likely cold starting...');
  console.log('\n💡 Solutions:');
  console.log('1. Wait 2-3 minutes for Render to wake up the service');
  console.log('2. Try accessing https://seminar-hall-booking-backend.onrender.com in browser');
  console.log('3. Refresh your login page after waiting');
  req.destroy();
});

req.on('error', (error) => {
  console.log('❌ Connection failed:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.log('🌐 DNS resolution failed - check internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('🚫 Connection refused - backend may be down');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('⏰ Connection timed out - backend may be starting');
  }
  
  console.log('\n🔧 Recommended actions:');
  console.log('1. Check Render dashboard for service status');
  console.log('2. Wait a few minutes and try again');
  console.log('3. Check if recent deployments completed successfully');
});

req.end();

console.log('⏳ Waiting for backend response...');

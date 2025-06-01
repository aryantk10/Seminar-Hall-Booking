const https = require('https');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'seminar-hall-booking-backend.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
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

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function populateHalls() {
  console.log('🏢 Populating halls in database...\n');

  try {
    // Test if populate endpoint exists
    console.log('1️⃣ Testing populate endpoint...');
    const populateResponse = await makeRequest('/api/halls/populate');
    console.log('Populate response:', populateResponse);

    if (populateResponse.status === 200) {
      console.log('✅ Halls populated successfully!');
      
      // Verify halls were created
      console.log('\n2️⃣ Verifying halls...');
      const hallsResponse = await makeRequest('/api/halls');
      console.log('Available halls:');
      hallsResponse.data.forEach(hall => {
        console.log(`- ${hall.name} (ID: ${hall._id})`);
      });
    } else {
      console.log('❌ Populate endpoint failed or not available');
    }

  } catch (error) {
    console.error('💥 Population failed:', error.message);
  }
}

populateHalls();

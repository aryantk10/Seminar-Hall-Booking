// Artillery helper functions for load testing

module.exports = {
  // Generate random string
  randomString: function(context, events, done) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    context.vars.randomString = result;
    return done();
  },

  // Generate random integer
  randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate future date (tomorrow to 30 days from now)
  futureDate: function(context, events, done) {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1);
    context.vars.futureDate = futureDate.toISOString().split('T')[0];
    return done();
  },

  // Generate random time slot
  randomTimeSlot: function(context, events, done) {
    const timeSlots = [
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '12:00-13:00',
      '13:00-14:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00'
    ];
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    context.vars.randomTimeSlot = randomSlot;
    return done();
  },

  // Generate random hall ID
  randomHallId: function(context, events, done) {
    const hallIds = ['hall-1', 'hall-2', 'hall-3', 'hall-4', 'hall-5'];
    const randomHall = hallIds[Math.floor(Math.random() * hallIds.length)];
    context.vars.randomHallId = randomHall;
    return done();
  },

  // Generate random user data
  randomUserData: function(context, events, done) {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
    const domains = ['example.com', 'test.com', 'demo.org'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}${Math.floor(Math.random() * 1000)}@${randomDomain}`;
    
    context.vars.randomName = randomName;
    context.vars.randomEmail = randomEmail;
    context.vars.randomPassword = 'testpassword123';
    
    return done();
  },

  // Log response times for monitoring
  logResponseTime: function(requestParams, response, context, ee, next) {
    if (response.timings) {
      console.log(`Response time: ${response.timings.response}ms for ${requestParams.url}`);
    }
    return next();
  },

  // Custom error handler
  handleError: function(requestParams, response, context, ee, next) {
    if (response.statusCode >= 400) {
      console.log(`Error ${response.statusCode} for ${requestParams.url}: ${response.body}`);
    }
    return next();
  },

  // Setup test data before scenarios
  setupTestData: function(context, events, done) {
    // This would typically seed the database with test data
    // For now, we'll just set some context variables
    context.vars.testDataSetup = true;
    console.log('Test data setup completed');
    return done();
  },

  // Cleanup test data after scenarios
  cleanupTestData: function(context, events, done) {
    // This would typically clean up test data from the database
    console.log('Test data cleanup completed');
    return done();
  },

  // Generate realistic booking purposes
  randomBookingPurpose: function(context, events, done) {
    const purposes = [
      'Team Meeting',
      'Client Presentation',
      'Training Session',
      'Workshop',
      'Conference Call',
      'Project Review',
      'Brainstorming Session',
      'Product Demo',
      'Interview',
      'Board Meeting'
    ];
    const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
    context.vars.randomPurpose = randomPurpose;
    return done();
  },

  // Validate response structure
  validateResponse: function(requestParams, response, context, ee, next) {
    try {
      if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
        const body = JSON.parse(response.body);
        
        // Basic validation
        if (response.statusCode === 200 || response.statusCode === 201) {
          if (!body.success && !body.data && !body.message) {
            console.log(`Warning: Unexpected response structure for ${requestParams.url}`);
          }
        }
      }
    } catch (error) {
      console.log(`Error parsing response for ${requestParams.url}: ${error.message}`);
    }
    
    return next();
  }
};

// Export individual functions for direct use
module.exports.randomString = module.exports.randomString;
module.exports.randomInt = module.exports.randomInt;
module.exports.futureDate = module.exports.futureDate;
module.exports.randomTimeSlot = module.exports.randomTimeSlot;

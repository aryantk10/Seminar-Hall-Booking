// Simple start script for production
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Seminar Hall Booking Backend...');
console.log('📁 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🔌 Port:', process.env.PORT || 5000);

// Check if dist directory exists
const fs = require('fs');
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory not found. Running build first...');
  process.exit(1);
}

// Start the application
console.log('✅ Starting application from dist/app.js');
require('./dist/app.js');

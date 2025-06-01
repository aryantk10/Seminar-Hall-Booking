#!/usr/bin/env node

/**
 * Sync Verification Script
 * Verifies that all environments are properly configured to use the production backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Verifying Perfect Sync Configuration...\n');

// Check configuration files
const checks = [
  {
    file: '.env.local',
    expected: 'NEXT_PUBLIC_API_URL=https://seminar-hall-booking-backend.onrender.com/api',
    description: 'Local environment file'
  },
  {
    file: 'next.config.js',
    expected: 'https://seminar-hall-booking-backend.onrender.com/api',
    description: 'Next.js configuration'
  },
  {
    file: 'src/lib/config.ts',
    expected: 'https://seminar-hall-booking-backend.onrender.com/api',
    description: 'Application configuration'
  },
  {
    file: 'docker-compose.yml',
    expected: 'NEXT_PUBLIC_API_URL=https://seminar-hall-booking-backend.onrender.com/api',
    description: 'Docker Compose production'
  },
  {
    file: 'docker-compose.dev.yml',
    expected: 'NEXT_PUBLIC_API_URL=https://seminar-hall-booking-backend.onrender.com/api',
    description: 'Docker Compose development'
  }
];

let allPassed = true;

checks.forEach(check => {
  try {
    const content = fs.readFileSync(check.file, 'utf8');
    const passed = content.includes(check.expected);
    
    console.log(`${passed ? '✅' : '❌'} ${check.description}: ${check.file}`);
    if (!passed) {
      console.log(`   Expected: ${check.expected}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.description}: ${check.file} (File not found)`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Perfect Sync Configuration VERIFIED!');
  console.log('✅ All environments will use the production backend');
  console.log('✅ Data will be synchronized across all platforms');
  console.log('\n🚀 Next steps:');
  console.log('1. Restart development server: npm run dev');
  console.log('2. Visit: http://localhost:9002/test-api');
  console.log('3. Verify sync status shows: ✅ Synced');
} else {
  console.log('❌ Sync configuration has issues');
  console.log('Please check the files marked with ❌ above');
}

console.log('\n📊 Environment URLs:');
console.log('• Development: http://localhost:9002 → Production Backend');
console.log('• Docker: http://localhost:9003 → Production Backend');
console.log('• Production: https://seminar-hall-booking-psi.vercel.app → Production Backend');
console.log('• Backend: https://seminar-hall-booking-backend.onrender.com');

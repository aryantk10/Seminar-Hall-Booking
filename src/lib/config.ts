// Environment configuration utility
export const config = {
  // API Configuration - PERFECT SYNC: Always use production backend
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://seminar-hall-booking-backend.onrender.com/api',

  // Environment Detection
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Seminar Hall Booking System',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Environment-specific settings
  enableDebug: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.NODE_ENV === 'production',

  // URLs for different environments - PERFECT SYNC CONFIGURATION
  // All environments use the same production backend for data consistency
  urls: {
    development: {
      frontend: 'http://localhost:9002',
      backend: 'https://seminar-hall-booking-backend.onrender.com/api'  // Production backend for perfect sync
    },
    production: {
      frontend: 'https://seminar-hall-booking-psi.vercel.app',
      backend: 'https://seminar-hall-booking-backend.onrender.com/api'
    }
  },

  // Sync Configuration - Force production backend for all environments
  getApiUrl: () => {
    // Always return production backend URL for perfect sync across all environments
    return 'https://seminar-hall-booking-backend.onrender.com/api';
  }
}

// Environment sync checker
export const checkEnvironmentSync = () => {
  const currentEnv = config.environment
  const expectedApiUrl = config.urls[currentEnv as keyof typeof config.urls]?.backend

  // Perfect sync configuration - both environments use production backend
  const isPerfectSync = config.apiUrl === 'https://seminar-hall-booking-backend.onrender.com/api'
  const isDockerDev = currentEnv === 'development' && config.apiUrl === 'http://localhost:5000/api'

  return {
    environment: currentEnv,
    apiUrl: config.apiUrl,
    expectedApiUrl,
    isSync: config.apiUrl === expectedApiUrl || isPerfectSync,
    mode: isPerfectSync ? 'Perfect Sync (Production Backend)' : isDockerDev ? 'Docker Development' : 'Standard',
    timestamp: new Date().toISOString()
  }
}

// Debug helper for development
export const debugConfig = () => {
  if (config.enableDebug) {
    console.log('🔧 Environment Configuration:', {
      environment: config.environment,
      apiUrl: config.apiUrl,
      isProduction: config.isProduction,
      isDevelopment: config.isDevelopment,
      sync: checkEnvironmentSync()
    })
  }
}

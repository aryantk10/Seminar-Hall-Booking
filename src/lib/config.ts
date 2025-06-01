// Environment configuration utility
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  
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
  
  // URLs for different environments
  urls: {
    development: {
      frontend: 'http://localhost:9002',
      backend: 'https://seminar-hall-booking-backend.onrender.com/api'  // Use production backend for sync
    },
    production: {
      frontend: 'https://seminar-hall-booking-psi.vercel.app',
      backend: 'https://seminar-hall-booking-backend.onrender.com/api'
    }
  }
}

// Environment sync checker
export const checkEnvironmentSync = () => {
  const currentEnv = config.environment
  const expectedApiUrl = config.urls[currentEnv as keyof typeof config.urls]?.backend
  
  return {
    environment: currentEnv,
    apiUrl: config.apiUrl,
    expectedApiUrl,
    isSync: config.apiUrl === expectedApiUrl,
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

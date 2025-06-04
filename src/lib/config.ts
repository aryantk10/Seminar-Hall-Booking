// Environment configuration utility
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',

  // Environment Detection
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Seminar Hall Booking System',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Environment-specific settings
  enableDebug: process.env.NODE_ENV !== 'production',
  enableAnalytics: process.env.NODE_ENV === 'production',

  // URLs for different environments
  urls: {
    development: {
      frontend: 'http://localhost:9002',
      backend: 'http://localhost:5000/api'
    },
    production: {
      frontend: 'http://localhost:9002',
      backend: 'http://localhost:5000/api'
    }
  },

  // API URL getter
  getApiUrl: () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
}

// Environment sync checker
export const checkEnvironmentSync = () => {
  const currentEnv = process.env.NODE_ENV || 'development'
  const expectedApiUrl = 'http://localhost:5000/api'

  return {
    environment: currentEnv,
    apiUrl: config.apiUrl,
    expectedApiUrl,
    isSync: config.apiUrl === expectedApiUrl,
    mode: 'Local Development',
    timestamp: new Date().toISOString()
  }
}

// Debug helper for development
export const debugConfig = () => {
  console.log('🔧 Environment Configuration:', {
    environment: config.environment,
    apiUrl: config.apiUrl,
    isProduction: config.isProduction,
    isDevelopment: config.isDevelopment,
    sync: checkEnvironmentSync()
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use environment variable or fallback to local development URL
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  },
  
  // Enable standalone output for better deployment
  output: 'standalone',
  
  // SWC minification is enabled by default in Next.js 13+
  
  // Image optimization
  images: {
    domains: ['localhost', 'seminar-hall-booking-backend.onrender.com', 'images.unsplash.com'],
    unoptimized: true
  },
  
  // Headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        ],
      },
    ]
  },

  typescript: {
    ignoreBuildErrors: true
  },

  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // PERFECT SYNC: Always use production backend for all environments
    NEXT_PUBLIC_API_URL: 'https://seminar-hall-booking-backend.onrender.com/api'
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
}

module.exports = nextConfig

#!/bin/bash

echo "🚀 Building Seminar Hall Booking Backend..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Backend build completed successfully!"
    echo "📁 Build output in backend/dist/"
else
    echo "❌ Backend build failed!"
    exit 1
fi

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

// Official Institute Halls - Auditorium and Seminar Halls
const mockHalls = [
  // Auditorium
  {
    id: 'apex-auditorium',
    name: 'APEX Auditorium',
    capacity: 1000,
    location: 'APEX Block',
    image: '/images/halls/apex-auditorium.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&crop=center',
    amenities: ['Large LED Screen', 'Professional Sound System', 'Stage Lighting', 'Green Room', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  },
  // ESB Seminar Halls
  {
    id: 'esb-hall-1',
    name: 'ESB Seminar Hall - I',
    capacity: 315,
    location: 'Engineering Sciences Block (ESB)',
    image: '/images/halls/esb-seminar-hall-1.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning', 'Podium'],
    isAvailable: true
  },
  {
    id: 'esb-hall-2',
    name: 'ESB Seminar Hall - II',
    capacity: 140,
    location: 'Engineering Sciences Block (ESB)',
    image: '/images/halls/esb-seminar-hall-2.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  },
  {
    id: 'esb-hall-3',
    name: 'ESB Seminar Hall - III',
    capacity: 200,
    location: 'Engineering Sciences Block (ESB)',
    image: '/images/halls/esb-seminar-hall-3.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  },
  // DES Seminar Halls
  {
    id: 'des-hall-1',
    name: 'DES Seminar Hall - I',
    capacity: 200,
    location: 'Department of Engineering Sciences (DES)',
    image: '/images/halls/des-seminar-hall-1.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&h=400&fit=crop&crop=center',
    amenities: ['Advanced Projector', 'Interactive Whiteboard', 'Sound System', 'Wi-Fi', 'Video Conferencing'],
    isAvailable: true
  },
  {
    id: 'des-hall-2',
    name: 'DES Seminar Hall - II',
    capacity: 150,
    location: 'Department of Engineering Sciences (DES)',
    image: '/images/halls/des-seminar-hall-2.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  },
  // LHC Seminar Halls
  {
    id: 'lhc-hall-1',
    name: 'LHC Seminar Hall - I',
    capacity: 115,
    location: 'Lecture Hall Complex (LHC)',
    image: '/images/halls/lhc-seminar-hall-1.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  },
  {
    id: 'lhc-hall-2',
    name: 'LHC Seminar Hall - II',
    capacity: 115,
    location: 'Lecture Hall Complex (LHC)',
    image: '/images/halls/lhc-seminar-hall-2.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=600&h=400&fit=crop&crop=center',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Air Conditioning'],
    isAvailable: true
  }
]

export default function HallsPage() {
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({})

  const handleImageError = (hallId: string) => {
    setImageErrors(prev => ({ ...prev, [hallId]: true }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Seminar Hall Booking
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link href="/halls" className="text-blue-600 font-medium">
                Halls
              </Link>
              <Link href="/bookings" className="text-gray-700 hover:text-gray-900">
                Bookings
              </Link>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Halls</h1>
          <p className="text-gray-600">Browse and select from our available seminar halls</p>
        </div>

        {/* Hall List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-cy="hall-list">
          {mockHalls.map((hall) => (
            <div
              key={hall.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              data-cy="hall-card"
              onClick={() => window.location.href = `/halls/${hall.id}`}
            >
              {/* Hall Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={imageErrors[hall.id] ? hall.fallbackImage : hall.image}
                  alt={hall.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(hall.id)}
                />
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2" data-cy="hall-name">
                    {hall.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="text-sm" data-cy="hall-capacity">
                      Capacity: {hall.capacity} people
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-sm" data-cy="hall-location">
                      📍 {hall.location}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {hall.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      hall.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {hall.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      hall.isAvailable
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!hall.isAvailable}
                    data-cy="book-hall-button"
                  >
                    {hall.isAvailable ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar View Toggle */}
        <div className="mt-8 text-center">
          <button 
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
            data-cy="calendar-view"
            onClick={() => alert('Calendar view would be implemented here')}
          >
            📅 Switch to Calendar View
          </button>
        </div>
      </main>
    </div>
  )
}

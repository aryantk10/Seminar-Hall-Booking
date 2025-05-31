'use client'

import Link from 'next/link'

// Mock hall data for Cypress testing
const mockHalls = [
  {
    id: 'hall-1',
    name: 'Conference Room A',
    capacity: 50,
    location: 'Building 1, Floor 2',
    amenities: ['Projector', 'Whiteboard', 'AC', 'WiFi'],
    isAvailable: true
  },
  {
    id: 'hall-2', 
    name: 'Seminar Hall B',
    capacity: 100,
    location: 'Building 2, Floor 1',
    amenities: ['Projector', 'Sound System', 'AC', 'WiFi'],
    isAvailable: true
  },
  {
    id: 'hall-3',
    name: 'Auditorium C',
    capacity: 200,
    location: 'Main Building, Ground Floor',
    amenities: ['Stage', 'Sound System', 'Lighting', 'AC', 'WiFi'],
    isAvailable: false
  }
]

export default function HallsPage() {
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
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              data-cy="hall-card"
              onClick={() => window.location.href = `/halls/${hall.id}`}
            >
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

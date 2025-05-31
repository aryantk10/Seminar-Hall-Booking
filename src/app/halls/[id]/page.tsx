import Link from 'next/link'

// Mock hall details for Cypress testing
const getHallDetails = (id: string) => {
  const halls: Record<string, any> = {
    'hall-1': {
      id: 'hall-1',
      name: 'Conference Room A',
      capacity: 50,
      location: 'Building 1, Floor 2',
      description: 'A modern conference room perfect for meetings, presentations, and small seminars. Equipped with the latest technology and comfortable seating.',
      amenities: ['Projector', 'Whiteboard', 'AC', 'WiFi', 'Video Conferencing'],
      images: ['https://placehold.co/600x400/e2e8f0/64748b?text=Conference+Room+A'],
      isAvailable: true,
      pricePerHour: 500
    },
    'hall-2': {
      id: 'hall-2',
      name: 'Seminar Hall B', 
      capacity: 100,
      location: 'Building 2, Floor 1',
      description: 'Spacious seminar hall ideal for workshops, training sessions, and medium-sized events. Features excellent acoustics and lighting.',
      amenities: ['Projector', 'Sound System', 'AC', 'WiFi', 'Stage'],
      images: ['https://placehold.co/600x400/ddd6fe/7c3aed?text=Seminar+Hall+B'],
      isAvailable: true,
      pricePerHour: 800
    },
    'hall-3': {
      id: 'hall-3',
      name: 'Auditorium C',
      capacity: 200,
      location: 'Main Building, Ground Floor',
      description: 'Large auditorium perfect for conferences, lectures, and major events. Professional-grade audio-visual equipment included.',
      amenities: ['Stage', 'Sound System', 'Lighting', 'AC', 'WiFi', 'Recording Equipment'],
      images: ['https://placehold.co/600x400/fecaca/dc2626?text=Auditorium+C'],
      isAvailable: false,
      pricePerHour: 1200
    }
  }
  
  return halls[id] || halls['hall-1']
}

export default function HallDetailsPage({ params }: { params: { id: string } }) {
  const hall = getHallDetails(params.id)

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
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/halls" className="hover:text-blue-600">Halls</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{hall.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" data-cy="hall-details">
          {/* Hall Image */}
          <div className="h-64 bg-gray-200">
            <img 
              src={hall.images[0]} 
              alt={hall.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            {/* Hall Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-cy="hall-name">
                  {hall.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-lg" data-cy="hall-capacity">
                    👥 Capacity: {hall.capacity} people
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span data-cy="hall-location">📍 {hall.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ₹{hall.pricePerHour}/hour
                </div>
                <span 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hall.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {hall.isAvailable ? 'Available' : 'Occupied'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed" data-cy="hall-description">
                {hall.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hall.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Section */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className={`flex-1 py-3 px-6 rounded-md font-medium text-lg ${
                    hall.isAvailable
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hall.isAvailable}
                  data-cy="book-hall-button"
                  onClick={() => {
                    if (hall.isAvailable) {
                      // Simulate navigation to booking form
                      alert('Redirecting to booking form...')
                    }
                  }}
                >
                  {hall.isAvailable ? 'Book This Hall' : 'Currently Unavailable'}
                </button>
                <button 
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => alert('Check availability calendar would open here')}
                >
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Halls */}
        <div className="mt-8">
          <Link 
            href="/halls" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to All Halls
          </Link>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'

// Hall interface
interface Hall {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  pricePerHour: number;
}

async function getHallDetails(id: string): Promise<Hall> {
  try {
    const response = await fetch(`/api/halls/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Disable caching to always get fresh data
    });

    if (!response.ok) {
      throw new Error('Hall not found');
    }

    const data = await response.json();
    
    // Transform the data to match our Hall interface
    return {
      id: data.frontendId || data._id || data.id,
      name: data.name,
      capacity: data.capacity,
      location: data.location,
      description: data.description || 'No description available',
      amenities: data.facilities || [],
      images: data.images || ['/images/halls/default-hall.jpg'],
      isAvailable: data.isAvailable !== false,
      pricePerHour: data.pricePerHour || 1000 // Default price if not set
    };
  } catch (error) {
    console.error('Error fetching hall details:', error);
    throw new Error('Failed to fetch hall details');
  }
}

export default async function HallDetailsPage({ params }: { params: { id: string } }) {
  let hall: Hall;
  
  try {
    hall = await getHallDetails(params.id);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hall Not Found</h1>
          <p className="text-gray-600 mb-8">The hall you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/halls"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Halls
          </Link>
        </div>
      </div>
    );
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
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link href="/halls" className="hover:text-blue-600">Halls</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{hall.name}</li>
          </ol>
        </nav>

        <div className="max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-200">
            <Image
              src={hall.images[0]}
              alt={hall.name}
              fill
              className="object-cover"
              priority
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hall.amenities.map((amenity, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 text-gray-600"
                  >
                    <span>✓</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/book/${hall.id}`}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
              >
                Book Now
              </Link>
              <Link
                href="/halls"
                className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Halls
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client'

import Link from 'next/link'

// Mock bookings data for Cypress testing
const mockBookings = [
  {
    id: 'booking-1',
    hallName: 'Conference Room A',
    date: '2024-01-20',
    timeSlot: '09:00-10:00',
    purpose: 'Team Meeting',
    status: 'approved',
    createdAt: '2024-01-15'
  },
  {
    id: 'booking-2',
    hallName: 'Seminar Hall B', 
    date: '2024-01-22',
    timeSlot: '14:00-16:00',
    purpose: 'Workshop on AI',
    status: 'pending',
    createdAt: '2024-01-16'
  },
  {
    id: 'booking-3',
    hallName: 'Auditorium C',
    date: '2024-01-25',
    timeSlot: '10:00-12:00',
    purpose: 'Research Presentation',
    status: 'cancelled',
    createdAt: '2024-01-17'
  },
  {
    id: 'booking-4',
    hallName: 'Conference Room A',
    date: '2024-01-28',
    timeSlot: '15:00-17:00',
    purpose: 'Client Meeting',
    status: 'approved',
    createdAt: '2024-01-18'
  }
]

export default function BookingsPage() {
  const handleCancelBooking = (bookingId: string) => {
    alert(`Booking ${bookingId} has been cancelled!`)
  }

  const handleConfirmCancel = () => {
    // This would be triggered by Cypress test
    alert('Booking cancelled successfully!')
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
              <Link href="/halls" className="text-gray-700 hover:text-gray-900">
                Halls
              </Link>
              <Link href="/bookings" className="text-blue-600 font-medium">
                Bookings
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
              <p className="text-gray-600">Manage your seminar hall reservations</p>
            </div>
            <Link 
              href="/bookings/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              + New Booking
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                All Bookings
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Pending
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Approved
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Cancelled
              </button>
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md" data-cy="booking-list">
          <ul className="divide-y divide-gray-200">
            {mockBookings.map((booking) => (
              <li key={booking.id} data-cy="booking-item">
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-medium text-gray-900 truncate" data-cy="booking-hall">
                            {booking.hallName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.purpose}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900" data-cy="booking-date">
                            {booking.date}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.timeSlot}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                            data-cy="booking-status"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Created: {booking.createdAt}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            onClick={() => alert(`Viewing details for ${booking.hallName}`)}
                          >
                            View Details
                          </button>
                          
                          {booking.status === 'pending' && (
                            <button 
                              className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                              onClick={() => alert(`Editing booking for ${booking.hallName}`)}
                            >
                              Edit
                            </button>
                          )}
                          
                          {(booking.status === 'pending' || booking.status === 'approved') && (
                            <button 
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                              data-cy="cancel-booking"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Empty State (if no bookings) */}
        {mockBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Get started by making your first seminar hall reservation.</p>
            <Link 
              href="/halls"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Browse Available Halls
            </Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{mockBookings.length}</span> of{' '}
            <span className="font-medium">{mockBookings.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal (for Cypress testing) */}
      <div id="cancel-modal" className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900">Cancel Booking</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
            </div>
            <div className="items-center px-4 py-3">
              <button 
                className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 mr-2"
                data-cy="confirm-cancel"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel
              </button>
              <button 
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400"
                onClick={() => document.getElementById('cancel-modal')?.classList.add('hidden')}
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

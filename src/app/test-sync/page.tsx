'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

interface BookingData {
  _id: string
  hall: {
    name: string
  }
  startDate: string
  endDate: string
  purpose: string
  status: string
}

export default function TestSyncPage() {
  const { user } = useAuth()
  const isAuthenticated = !!user // Derive authentication status from user existence
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testBooking, setTestBooking] = useState<unknown>(null)

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please login to test sync')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/bookings')
      setBookings(response.data as BookingData[])
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const createTestBooking = async () => {
    if (!isAuthenticated) {
      setError('Please login to create test booking')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Get available halls first
      const hallsResponse = await api.get('/halls')
      const halls = hallsResponse.data as unknown[]

      if (halls.length === 0) {
        setError('No halls available for booking')
        return
      }

      // Create a test booking
      const testBookingData = {
        hall: (halls[0] as { _id: string })._id,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        purpose: `SYNC TEST - ${new Date().toLocaleString()}`,
        attendees: 10,
        requirements: 'Testing database sync between localhost and Vercel'
      }

      const response = await api.post('/bookings', testBookingData)
      setTestBooking(response.data)
      
      // Refresh bookings list
      await fetchBookings()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated, fetchBookings])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Sync Test</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        {isAuthenticated ? (
          <div className="text-green-600">
            ✅ Logged in as: {user?.name} ({user?.email})
            <br />
            Role: {user?.role}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ Not logged in - Please <a href="/login" className="underline">login</a> to test sync
          </div>
        )}
      </div>

      {/* API Configuration */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <div className="text-sm">
          <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
          <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</div>
          <div><strong>Current Location:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server'}</div>
        </div>
      </div>

      {/* Test Actions */}
      {isAuthenticated && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sync Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={createTestBooking}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Booking'}
            </button>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Bookings'}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Test Booking Result */}
      {testBooking && (
        <div className="mb-6 p-4 border border-green-300 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">✅ Test Booking Created:</h3>
          <div className="text-sm mt-2">
            <div><strong>ID:</strong> {testBooking._id}</div>
            <div><strong>Purpose:</strong> {testBooking.purpose}</div>
            <div><strong>Status:</strong> {testBooking.status}</div>
            <div><strong>Created:</strong> {new Date(testBooking.createdAt).toLocaleString()}</div>
          </div>
          <p className="text-green-600 mt-2">
            Now check the other environment (localhost/Vercel) to see if this booking appears!
          </p>
        </div>
      )}

      {/* Current Bookings */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current Bookings ({bookings.length})</h2>
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No bookings found. Create a test booking to test sync!</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div key={booking._id} className="p-3 border rounded bg-gray-50">
                <div className="font-semibold">{booking.purpose}</div>
                <div className="text-sm text-gray-600">
                  Hall: {booking.hall?.name || 'Unknown'} | 
                  Status: {booking.status} | 
                  Date: {new Date(booking.startDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">ID: {booking._id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="font-semibold text-blue-800 mb-2">How to Test Sync:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Make sure you&apos;re logged in with the same user on both localhost and Vercel</li>
          <li>Create a test booking on this environment</li>
          <li>Go to the other environment (localhost ↔ Vercel)</li>
          <li>Refresh this page or check your bookings</li>
          <li>The test booking should appear immediately!</li>
        </ol>
      </div>
    </div>
  )
}

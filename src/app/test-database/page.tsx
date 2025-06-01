'use client'

import { useState, useEffect } from 'react'
import { config } from '@/lib/config'

interface DatabaseTest {
  environment: string
  apiUrl: string
  connected: boolean
  bookingCount: number
  hallCount: number
  userCount: number
  error?: string
  timestamp: string
}

export default function TestDatabasePage() {
  const [localTest, setLocalTest] = useState<DatabaseTest | null>(null)
  const [productionTest, setProductionTest] = useState<DatabaseTest | null>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async (apiUrl: string, environment: string): Promise<DatabaseTest> => {
    try {
      // Test basic connection
      const healthResponse = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`)
      }

      // Test database collections
      const [bookingsRes, hallsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/bookings`).catch(() => ({ ok: false, json: () => ({ length: 0 }) })),
        fetch(`${apiUrl}/halls`).catch(() => ({ ok: false, json: () => ({ length: 0 }) })),
        fetch(`${apiUrl}/auth/users`).catch(() => ({ ok: false, json: () => ({ length: 0 }) }))
      ])

      const bookings = bookingsRes.ok ? await bookingsRes.json() : []
      const halls = hallsRes.ok ? await hallsRes.json() : []
      const users = usersRes.ok ? await usersRes.json() : []

      return {
        environment,
        apiUrl,
        connected: true,
        bookingCount: Array.isArray(bookings) ? bookings.length : 0,
        hallCount: Array.isArray(halls) ? halls.length : 0,
        userCount: Array.isArray(users) ? users.length : 0,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        environment,
        apiUrl,
        connected: false,
        bookingCount: 0,
        hallCount: 0,
        userCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  const runTests = async () => {
    setLoading(true)
    try {
      // Test localhost
      const localResult = await testDatabase('http://localhost:5000/api', 'localhost')
      setLocalTest(localResult)

      // Test production
      const prodResult = await testDatabase('https://seminar-hall-booking-backend.onrender.com/api', 'production')
      setProductionTest(prodResult)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const TestResult = ({ test, title }: { test: DatabaseTest | null, title: string }) => (
    <div className={`border rounded-lg p-4 ${
      test?.connected ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
    }`}>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      {test ? (
        <div className="space-y-2 text-sm">
          <div><strong>API URL:</strong> {test.apiUrl}</div>
          <div><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              test.connected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {test.connected ? '✅ Connected' : '❌ Failed'}
            </span>
          </div>
          {test.connected ? (
            <>
              <div><strong>Bookings:</strong> {test.bookingCount}</div>
              <div><strong>Halls:</strong> {test.hallCount}</div>
              <div><strong>Users:</strong> {test.userCount}</div>
            </>
          ) : (
            <div><strong>Error:</strong> {test.error}</div>
          )}
          <div><strong>Tested:</strong> {new Date(test.timestamp).toLocaleString()}</div>
        </div>
      ) : (
        <div>Testing...</div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <div><strong>Current Environment:</strong> {config.environment}</div>
          <div><strong>Current API URL:</strong> {config.apiUrl}</div>
          <div><strong>Expected Localhost:</strong> http://localhost:5000/api</div>
          <div><strong>Expected Production:</strong> https://seminar-hall-booking-backend.onrender.com/api</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TestResult test={localTest} title="Localhost Backend" />
        <TestResult test={productionTest} title="Production Backend" />
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Refresh Tests'}
        </button>
      </div>

      {localTest && productionTest && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-3">Database Sync Analysis</h3>
          <div className="space-y-2 text-sm">
            {localTest.connected && productionTest.connected ? (
              <>
                <div className={`p-2 rounded ${
                  localTest.bookingCount === productionTest.bookingCount 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <strong>Bookings Sync:</strong> 
                  Localhost: {localTest.bookingCount}, Production: {productionTest.bookingCount}
                  {localTest.bookingCount === productionTest.bookingCount ? ' ✅ Synced' : ' ⚠️ Different'}
                </div>
                <div className={`p-2 rounded ${
                  localTest.hallCount === productionTest.hallCount 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <strong>Halls Sync:</strong> 
                  Localhost: {localTest.hallCount}, Production: {productionTest.hallCount}
                  {localTest.hallCount === productionTest.hallCount ? ' ✅ Synced' : ' ⚠️ Different'}
                </div>
                <div className={`p-2 rounded ${
                  localTest.userCount === productionTest.userCount 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <strong>Users Sync:</strong> 
                  Localhost: {localTest.userCount}, Production: {productionTest.userCount}
                  {localTest.userCount === productionTest.userCount ? ' ✅ Synced' : ' ⚠️ Different'}
                </div>
              </>
            ) : (
              <div className="bg-red-100 text-red-800 p-2 rounded">
                ❌ Cannot compare - one or both connections failed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

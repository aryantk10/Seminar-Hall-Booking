'use client'

import { useState, useEffect } from 'react'
import { config, checkEnvironmentSync } from '@/lib/config'

interface TestResult {
  status: number | string;
  data: unknown;
  success: boolean;
  apiUrl?: string;
}

export default function TestAPIPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<ReturnType<typeof checkEnvironmentSync> | null>(null)
  const [windowLocation, setWindowLocation] = useState<string>('')

  useEffect(() => {
    setSyncStatus(checkEnvironmentSync())
    setWindowLocation(window.location.href)
  }, [])

  const testEndpoint = async (name: string, url: string) => {
    try {
      setLoading(true)
      const response = await fetch(url)
      const data = await response.json()
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          data: data,
          success: response.ok
        }
      }))
    } catch (error: unknown) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          data: error instanceof Error ? error.message : 'Unknown error',
          success: false
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      })
      const data = await response.json()
      setResults(prev => ({
        ...prev,
        'login-test': {
          status: response.status,
          data: data,
          success: response.ok,
          apiUrl: API_URL
        }
      }))
    } catch (error: unknown) {
      setResults(prev => ({
        ...prev,
        'login-test': {
          status: 'ERROR',
          data: error instanceof Error ? error.message : 'Unknown error',
          success: false
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Info & Sync Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Environment Variables</h3>
            <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'Not set'}</p>
            <p><strong>Current API URL:</strong> {config.apiUrl}</p>
            <p><strong>Window Location:</strong> {windowLocation || 'Loading...'}</p>
          </div>

          {syncStatus && (
            <div className={`p-4 rounded border-2 ${
              syncStatus.isSync
                ? 'bg-green-50 border-green-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  syncStatus.isSync ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                Sync Status
              </h3>
              <p><strong>Environment:</strong> {syncStatus.environment}</p>
              <p><strong>Configured URL:</strong> {syncStatus.apiUrl}</p>
              <p><strong>Expected URL:</strong> {syncStatus.expectedApiUrl}</p>
              <p><strong>Status:</strong> {syncStatus.isSync ? '✅ Synced' : '⚠️ Not Synced'}</p>
              <p className="text-xs text-gray-600 mt-1">{syncStatus.timestamp}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => testEndpoint('backend-health', 'https://seminar-hall-booking-backend.onrender.com/health')}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          disabled={loading}
        >
          Test Backend Health
        </button>
        
        <button
          onClick={() => testEndpoint('backend-api', 'https://seminar-hall-booking-backend.onrender.com/api')}
          className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
          disabled={loading}
        >
          Test Backend API
        </button>
        
        <button
          onClick={() => testEndpoint('backend-auth', 'https://seminar-hall-booking-backend.onrender.com/api/auth')}
          className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600"
          disabled={loading}
        >
          Test Auth Endpoint
        </button>
        
        <button
          onClick={testLogin}
          className="bg-red-500 text-white p-3 rounded hover:bg-red-600"
          disabled={loading}
        >
          Test Login Request (Env URL)
        </button>

        <button
          onClick={() => testEndpoint('direct-login', 'https://seminar-hall-booking-backend.onrender.com/api/auth/login')}
          className="bg-orange-500 text-white p-3 rounded hover:bg-orange-600"
          disabled={loading}
        >
          Test Direct Backend URL
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]: [string, TestResult]) => (
          <div key={name} className="border p-4 rounded">
            <h3 className="font-semibold text-lg mb-2">{name}</h3>
            <div className={`p-2 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p><strong>Status:</strong> {result.status}</p>
              {result.apiUrl && <p><strong>API URL:</strong> {result.apiUrl}</p>}
              <p><strong>Response:</strong></p>
              <pre className="text-sm overflow-auto">{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

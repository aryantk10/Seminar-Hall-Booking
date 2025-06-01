'use client'

import { useEffect, useState } from 'react'
import { config, checkEnvironmentSync } from '@/lib/config'

interface SyncStatus {
  environment: string
  apiUrl: string
  expectedApiUrl: string
  isSync: boolean
  timestamp: string
  mode?: string
}

export default function EnvironmentIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const status = checkEnvironmentSync()
    setSyncStatus(status)
    
    // Show indicator in development or if not synced
    setIsVisible(config.isDevelopment || !status.isSync)
  }, [])

  if (!isVisible || !syncStatus) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg text-xs max-w-sm ${
      syncStatus.isSync 
        ? 'bg-green-100 border border-green-300 text-green-800' 
        : 'bg-yellow-100 border border-yellow-300 text-yellow-800'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${
          syncStatus.isSync ? 'bg-green-500' : 'bg-yellow-500'
        }`}></span>
        <span className="font-semibold">
          {syncStatus.environment.toUpperCase()} Environment
        </span>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="font-medium">API:</span> {syncStatus.apiUrl}
        </div>
        
        {!syncStatus.isSync && (
          <div className="text-yellow-700">
            <span className="font-medium">Expected:</span> {syncStatus.expectedApiUrl}
          </div>
        )}
        
        <div className="text-xs opacity-75">
          {syncStatus.isSync ? `✅ ${syncStatus.mode || 'Synced'}` : '⚠️ Configuration Mismatch'}
        </div>
      </div>
    </div>
  )
}

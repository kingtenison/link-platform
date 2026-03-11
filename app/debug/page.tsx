'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug/analytics')
      const json = await res.json()
      setData(json)
    } catch (error) {
      setData({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testClick = async () => {
    setLoading(true)
    try {
      // Get first link
      const linksRes = await fetch('/api/debug/analytics')
      const linksJson = await linksRes.json()
      
      if (!linksJson.links || linksJson.links.length === 0) {
        alert('No links found')
        return
      }

      const firstLink = linksJson.links[0]
      
      // Manually insert a test click
      const insertRes = await fetch('/api/debug/insert-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: firstLink.id })
      })
      
      const result = await insertRes.json()
      alert(result.message || 'Click inserted')
      
      // Refresh data
      checkAnalytics()
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Analytics Debug Page</h1>
      
      <div className="space-x-4 mb-8">
        <button
          onClick={checkAnalytics}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check Analytics Data
        </button>
        
        <button
          onClick={testClick}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Insert Test Click
        </button>
      </div>

      {data && (
        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      {data?.message && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <p className="font-bold">Status: {data.message}</p>
        </div>
      )}
    </div>
  )
}

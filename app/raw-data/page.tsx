'use client'

import { useState } from 'react'

export default function RawDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchRawData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/debug/raw-clicks')
      const json = await res.json()
      setData(json)
    } catch (error) {
      setData({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Raw Click Data</h1>
      
      <button
        onClick={fetchRawData}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Loading...' : 'Fetch Raw Click Data'}
      </button>

      {data && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="font-bold">Summary:</p>
            <p>Total Clicks: {data.total_clicks}</p>
            <p>User ID: {data.user_id}</p>
            <p>{data.message}</p>
          </div>

          {data.clicks && data.clicks.length > 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-2">Click Records:</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">ID</th>
                      <th className="px-4 py-2 border">Link ID</th>
                      <th className="px-4 py-2 border">Clicked At</th>
                      <th className="px-4 py-2 border">Device</th>
                      <th className="px-4 py-2 border">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clicks.map((click: any) => (
                      <tr key={click.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{click.id.substring(0, 8)}...</td>
                        <td className="px-4 py-2 border">{click.link_id?.substring(0, 8)}...</td>
                        <td className="px-4 py-2 border">{new Date(click.clicked_at).toLocaleString()}</td>
                        <td className="px-4 py-2 border">{click.device_type || 'N/A'}</td>
                        <td className="px-4 py-2 border">{click.country || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-red-600">No click records found</p>
          )}

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Raw JSON:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

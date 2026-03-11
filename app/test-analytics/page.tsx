'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAnalytics() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testClick = async () => {
    setLoading(true)
    try {
      // Get the first link from your account
      const { data: links } = await supabase
        .from('links')
        .select('*')
        .limit(1)
      
      if (!links || links.length === 0) {
        alert('No links found')
        return
      }

      const link = links[0]
      
      // Manually insert a test click
      const { data, error } = await supabase
        .from('click_analytics')
        .insert([{
          link_id: link.id,
          user_id: link.user_id,
          device_type: 'test',
          browser: 'test',
          referer: 'test',
          clicked_at: new Date().toISOString(),
          ip_address: '127.0.0.1',
          user_agent: 'test',
          country: 'Test Country',
          city: 'Test City',
          success: true
        }])
        .select()

      if (error) throw error
      
      setResults({
        message: 'Test click inserted!',
        data,
        link
      })
    } catch (error: any) {
      setResults({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const checkClicks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('click_analytics')
        .select(`
          *,
          links (
            short_code,
            user_id
          )
        `)
        .order('clicked_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      setResults({
        clicks: data,
        count: data.length
      })
    } catch (error: any) {
      setResults({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Test Page</h1>
      
      <div className="space-x-4 mb-8">
        <button
          onClick={testClick}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Insert Test Click
        </button>
        
        <button
          onClick={checkClicks}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Check Recent Clicks
        </button>
      </div>

      {results && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  )
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { linkId } = await request.json()

    // Get user from token
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = await verifyToken(token)
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('>>> Inserting test click for link:', linkId, 'user:', userId)

    // Simple insert without complex checks
    const { data, error } = await supabase
      .from('click_analytics')
      .insert([{
        link_id: linkId,
        user_id: userId,
        device_type: 'debug',
        browser: 'Chrome',
        os: 'Windows',
        referer: 'https://debug.com',
        referer_domain: 'debug.com',
        clicked_at: new Date().toISOString(),
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (debug)',
        country: 'United States',
        city: 'New York',
        success: true,
        visitor_id: 'visitor_' + Date.now(),
        language: 'en-US'
      }])
      .select()

    if (error) {
      console.error('>>> Insert error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        code: error.code 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test click inserted',
      data 
    })

  } catch (error: any) {
    console.error('>>> Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

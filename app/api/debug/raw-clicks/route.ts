import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
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

    console.log('>>> Fetching raw clicks for user:', userId)

    // Get raw clicks with all fields
    const { data: clicks, error: clicksError } = await supabase
      .from('click_analytics')
      .select(`
        id,
        link_id,
        user_id,
        clicked_at,
        device_type,
        browser,
        country,
        visitor_id,
        success
      `)
      .eq('user_id', userId)
      .order('clicked_at', { ascending: false })

    if (clicksError) {
      console.error('>>> Error fetching clicks:', clicksError)
      throw clicksError
    }

    // Get links for reference
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, short_code, clicks_count')
      .eq('user_id', userId)

    if (linksError) {
      console.error('>>> Error fetching links:', linksError)
      throw linksError
    }

    console.log('>>> Found clicks:', clicks?.length || 0)

    return NextResponse.json({
      user_id: userId,
      total_clicks: clicks?.length || 0,
      clicks: clicks || [],
      links: links || [],
      message: clicks?.length === 0 
        ? 'No clicks found in database' 
        : `Found ${clicks?.length} clicks`
    })

  } catch (error: any) {
    console.error('>>> Error in raw-clicks API:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error.details 
    }, { status: 500 })
  }
}

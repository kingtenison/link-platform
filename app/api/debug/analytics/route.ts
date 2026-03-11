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

    // Get user's links
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, short_code, clicks_count')
      .eq('user_id', userId)

    if (linksError) throw linksError

    // Get clicks for user's links
    const { data: clicks, error: clicksError } = await supabase
      .from('click_analytics')
      .select(`
        *,
        links (
          short_code
        )
      `)
      .eq('user_id', userId)
      .order('clicked_at', { ascending: false })
      .limit(50)

    if (clicksError) throw clicksError

    return NextResponse.json({
      user_id: userId,
      links_count: links?.length || 0,
      links: links,
      clicks_count: clicks?.length || 0,
      clicks: clicks,
      message: clicks?.length === 0 
        ? 'No clicks found in database' 
        : `Found ${clicks?.length} clicks`
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

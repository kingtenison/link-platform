import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    const searchParams = request.nextUrl.searchParams
    const password = searchParams.get('password')
    
    console.log('>>> Redirect called for:', shortCode)

    if (!shortCode) {
      return new NextResponse('Short code is required', { status: 400 })
    }

    // Get link from database
    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (error || !link) {
      console.log('>>> Link not found:', shortCode)
      return new NextResponse('Link not found', { status: 404 })
    }

    // Check if link is scheduled
    if (link.scheduled_at && new Date(link.scheduled_at) > new Date()) {
      console.log('>>> Link is scheduled for future:', link.scheduled_at)
      return new NextResponse('Link not yet active', { status: 403 })
    }

    // Check if link has expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      console.log('>>> Link has expired')
      return new NextResponse('Link has expired', { status: 410 })
    }

    // Check max clicks
    if (link.max_clicks && link.clicks_count >= link.max_clicks) {
      console.log('>>> Link has reached max clicks')
      return new NextResponse('Link has reached maximum clicks', { status: 403 })
    }

    // Check password protection
    if (link.password_hash) {
      if (!password) {
        return new NextResponse('Password required', { status: 401 })
      }

      const isValid = await bcrypt.compare(password, link.password_hash)
      
      if (!isValid) {
        console.log('>>> Invalid password for link')
        return new NextResponse(null, {
          status: 302,
          headers: {
            'Location': `/${shortCode}?error=invalid`
          }
        })
      }
    }

    console.log('>>> Link found, redirecting to:', link.original_url)

    // Track the click
    try {
      await supabase
        .from('click_analytics')
        .insert([{
          link_id: link.id,
          user_id: link.user_id,
          device_type: request.headers.get('sec-ch-ua-platform') || 'web',
          browser: request.headers.get('sec-ch-ua') || 'unknown',
          referer: request.headers.get('referer') || 'direct',
          clicked_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          // REMOVED: request.geo - not available in all environments
          success: true,
          visitor_id: `visitor_${Date.now()}`
        }])
    } catch (e) {
      console.error('>>> Error tracking click:', e)
    }

    // Update link click count
    try {
      await supabase
        .from('links')
        .update({ 
          clicks_count: (link.clicks_count || 0) + 1,
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', link.id)
    } catch (e) {
      console.error('>>> Error updating click count:', e)
    }

    // Redirect to original URL
    return NextResponse.redirect(link.original_url, 302)

  } catch (error) {
    console.error('>>> Redirect error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
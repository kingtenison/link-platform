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
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Not Active Yet</title>
          <style>
            body { font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; padding: 40px; border-radius: 20px; text-align: center; }
            h1 { color: #333; } p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⏳ Link Not Active Yet</h1>
            <p>This link is scheduled to go live on ${new Date(link.scheduled_at).toLocaleString()}</p>
          </div>
        </body>
        </html>
      `, { status: 403, headers: { 'Content-Type': 'text/html' } })
    }

    // Check if link has expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      console.log('>>> Link has expired')
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Expired</title>
          <style>
            body { font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; padding: 40px; border-radius: 20px; text-align: center; }
            h1 { color: #333; } p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⌛ Link Expired</h1>
            <p>This link has expired and is no longer available.</p>
          </div>
        </body>
        </html>
      `, { status: 410, headers: { 'Content-Type': 'text/html' } })
    }

    // Check max clicks
    if (link.max_clicks && link.clicks_count >= link.max_clicks) {
      console.log('>>> Link has reached max clicks')
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Link Limit Reached</title>
          <style>
            body { font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { background: white; padding: 40px; border-radius: 20px; text-align: center; }
            h1 { color: #333; } p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔒 Link Limit Reached</h1>
            <p>This link has reached its maximum click limit.</p>
          </div>
        </body>
        </html>
      `, { status: 403, headers: { 'Content-Type': 'text/html' } })
    }

    // Check password protection
    if (link.password_hash) {
      // If no password provided, show password page
      if (!password) {
        console.log('>>> Password required for link')
        return new NextResponse(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Password Protected Link</title>
            <style>
              body { font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
              .container { background: white; padding: 40px; border-radius: 20px; max-width: 400px; }
              h1 { color: #333; text-align: center; }
              input { width: 100%; padding: 12px; margin: 10px 0; border: 2px solid #e0e0e0; border-radius: 10px; }
              button { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; }
              .error { color: red; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔐 Protected Link</h1>
              <p>This link is password protected.</p>
              <form method="GET">
                <input type="password" name="password" placeholder="Enter password" required>
                <button type="submit">Access Link</button>
                ${searchParams.get('error') === 'invalid' ? '<p class="error">Incorrect password</p>' : ''}
              </form>
            </div>
          </body>
        </html>
        `, { status: 401, headers: { 'Content-Type': 'text/html' } })
      }

      // Verify password
      const isValid = await bcrypt.compare(password, link.password_hash)
      
      if (!isValid) {
        console.log('>>> Invalid password for link')
        return NextResponse.redirect(
          `${request.nextUrl.origin}/${shortCode}?error=invalid`
        )
      }
    }

    console.log('>>> Link found, redirecting to:', link.original_url)

    // Track the click
    try {
      const clickData = {
        link_id: link.id,
        user_id: link.user_id,
        device_type: request.headers.get('sec-ch-ua-platform') || 'web',
        browser: request.headers.get('sec-ch-ua') || 'unknown',
        clicked_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        country: request.geo?.country || 'Unknown',
        success: true,
        visitor_id: `visitor_${Date.now()}`
      }
      
      await supabase.from('click_analytics').insert([clickData])
    } catch (e) {
      console.error('>>> Error tracking click:', e)
    }

    // Update link click count
    await supabase
      .from('links')
      .update({ 
        clicks_count: (link.clicks_count || 0) + 1,
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', link.id)

    return NextResponse.redirect(link.original_url, 302)

  } catch (error) {
    console.error('>>> Redirect error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

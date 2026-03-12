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

    // Determine if we should show an ad (EVERY CLICK)
    const shouldShowAd = true

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

    // Show ad page if needed
    if (shouldShowAd) {
      console.log('>>> Showing ad for link:', shortCode)
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Loading your link...</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                color: white;
                text-align: center;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 2rem;
                border-radius: 1rem;
                max-width: 400px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              .loader {
                border: 4px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 20px auto;
              }
              @keyframes spin { to { transform: rotate(360deg); } }
              .countdown { font-size: 2rem; font-weight: bold; margin: 1rem 0; }
              .support { margin-top: 2rem; font-size: 0.875rem; opacity: 0.8; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Preparing your link</h2>
              <div class="loader"></div>
              <p>You'll be redirected in <span id="countdown">5</span> seconds</p>
              <p class="support">Thanks for supporting LinkPlatform!</p>
            </div>
            
            <!-- Popunder Ad Code -->
            <script src="https://pl28900365.effectivegatecpm.com/e0/04/20/e00420d152c910988ed3141d4d763572.js"></script>
            
            <script>
              // Countdown timer
              let seconds = 5;
              const countdownEl = document.getElementById('countdown');
              const interval = setInterval(() => {
                seconds--;
                countdownEl.textContent = seconds;
                if (seconds <= 0) {
                  clearInterval(interval);
                  window.location.href = '${link.original_url}';
                }
              }, 1000);
            </script>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Normal redirect without ad
    console.log('>>> No ad, redirecting to:', link.original_url)
    return NextResponse.redirect(link.original_url, 302)

  } catch (error) {
    console.error('>>> Redirect error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

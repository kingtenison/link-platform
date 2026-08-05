import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateVisitorId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `visitor_${timestamp}_${random}`
}

function parseUserAgent(ua: string | null): { device_type: string; browser: string; os: string } {
  if (!ua) return { device_type: 'unknown', browser: 'unknown', os: 'unknown' }

  let device_type = 'desktop'
  if (/mobile|android|iphone|ipad/i.test(ua)) device_type = 'mobile'
  else if (/tablet|ipad/i.test(ua)) device_type = 'tablet'

  let browser = 'unknown'
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = 'Chrome'
  else if (/firefox/i.test(ua)) browser = 'Firefox'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/edge/i.test(ua)) browser = 'Edge'
  else if (/opr|opera/i.test(ua)) browser = 'Opera'

  let os = 'unknown'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'

  return { device_type, browser, os }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    const searchParams = request.nextUrl.searchParams
    const password = searchParams.get('password')

    if (!shortCode) {
      return new NextResponse('Short code is required', { status: 400 })
    }

    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .single()

    if (error || !link) {
      return new NextResponse('Link not found', { status: 404 })
    }

    if (link.scheduled_at && new Date(link.scheduled_at) > new Date()) {
      return new NextResponse('Link not yet active', { status: 403 })
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new NextResponse('Link has expired', { status: 410 })
    }

    if (link.max_clicks && link.clicks_count >= link.max_clicks) {
      return new NextResponse('Link has reached maximum clicks', { status: 403 })
    }

    if (link.password_hash) {
      if (!password) {
        return new NextResponse('Password required', { status: 401 })
      }
      const isValid = await bcrypt.compare(password, link.password_hash)
      if (!isValid) {
        return new NextResponse(null, {
          status: 302,
          headers: { 'Location': `/${shortCode}?error=invalid` }
        })
      }
    }

    const ua = request.headers.get('user-agent')
    const { device_type, browser, os } = parseUserAgent(ua)
    const referer = request.headers.get('referer') || 'direct'
    const refererDomain = referer !== 'direct' ? (() => { try { return new URL(referer).hostname } catch { return 'unknown' } })() : 'direct'
    const acceptLanguage = request.headers.get('accept-language')?.split(',')[0] || 'en-US'

    try {
      await supabase.from('click_analytics').insert([{
        link_id: link.id,
        user_id: link.user_id,
        device_type,
        browser,
        os,
        referer,
        referer_domain: refererDomain,
        clicked_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        user_agent: ua || 'unknown',
        success: true,
        visitor_id: generateVisitorId(),
        language: acceptLanguage,
      }])
    } catch (e) {
      console.error('Error tracking click:', e)
    }

    try {
      await supabase
        .from('links')
        .update({
          clicks_count: (link.clicks_count || 0) + 1,
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', link.id)
    } catch (e) {
      console.error('Error updating click count:', e)
    }

    const shouldShowAd = link.monetize !== false

    if (shouldShowAd) {
      const safeUrl = escapeHtml(link.original_url)
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

            <script src="https://pl28900365.effectivegatecpm.com/e0/04/20/e00420d152c910988ed3141d4d763572.js"></script>

            <script>
              var seconds = 5;
              var countdownEl = document.getElementById('countdown');
              var interval = setInterval(function() {
                seconds--;
                countdownEl.textContent = seconds;
                if (seconds <= 0) {
                  clearInterval(interval);
                  window.location.href = '${safeUrl}';
                }
              }, 1000);
            </script>
          </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      )
    }

    return NextResponse.redirect(link.original_url, 302)

  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

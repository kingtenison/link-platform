import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { parseClientInfo } from '@/lib/api'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// JSON.stringify outputs a valid JS string literal; escaping "<" below guards
// against "</script>" from breaking out of the embedded script element. HTML
// escaping is NOT safe inside <script> (raw text), so never mix the two.
function toScriptString(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

// Stable, per-visitor-per-day identifier derived from IP + user agent.
// Used to approximate unique visitors without storing raw identifiers.
function generateVisitorId(ipHash: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10)
  const base = `${ipHash}::${ua}::${day}`
  let hash = 0
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0
  }
  return `visitor_${day.replace(/-/g, '')}_${hash.toString(36)}`
}

function passwordPage({
  shortCode,
  error,
}: {
  shortCode: string
  error: boolean
}): NextResponse {
  const action = `/${escapeHtml(shortCode)}`
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Password Protected Link</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex, nofollow">
        <meta name="referrer" content="no-referrer">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #0f766e 0%, #164e63 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: white;
            padding: 1rem;
            box-sizing: border-box;
          }
          .container {
            background: rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(12px);
            padding: 2rem;
            border-radius: 1rem;
            width: 100%;
            max-width: 380px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
          p { margin: 0 0 1.25rem; font-size: 0.9rem; opacity: 0.85; }
          input {
            width: 100%;
            box-sizing: border-box;
            padding: 0.75rem 1rem;
            border-radius: 0.6rem;
            border: none;
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }
          button {
            width: 100%;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 0.6rem;
            background: white;
            color: #134e4a;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
          }
          .error {
            background: rgba(220, 38, 38, 0.85);
            padding: 0.6rem 0.9rem;
            border-radius: 0.5rem;
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }
          label {
            display: block;
            font-size: 0.8rem;
            opacity: 0.8;
            margin-bottom: 0.4rem;
          }
        </style>
      </head>
      <body>
        <form class="container" method="post" action="${action}">
          <h1>This link is password protected</h1>
          <p>Enter the password to continue.</p>
          ${error ? '<div class="error" role="alert">Incorrect password. Please try again.</div>' : ''}
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
          <button type="submit">Continue</button>
        </form>
      </body>
    </html>`,
    {
      status: 401,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    }
  )
}

function deny(message: string, status: number): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="robots" content="noindex, nofollow">
        <title>Link unavailable</title>
      </head>
      <body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#111827;background:#f9fafb;">
        <div style="text-align:center;padding:2rem;">
          <h1 style="font-size:1.25rem;margin:0 0 0.5rem;">${escapeHtml(message)}</h1>
          <p style="color:#6b7280;font-size:0.9rem;margin:0;">Please contact the link owner if you believe this is a mistake.</p>
        </div>
      </body>
    </html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
      },
    }
  )
}

async function redirectFlow(
  request: NextRequest,
  link: {
    id: string
    user_id: string | null
    short_code: string
    original_url: string
    is_active: boolean
    scheduled_at: string | null
    expires_at: string | null
    monetize: boolean
  }
): Promise<NextResponse> {
  const now = new Date()

  if (link.is_active === false) {
    return deny('This link is not active', 403)
  }

  if (link.scheduled_at && new Date(link.scheduled_at) > now) {
    return deny('This link is not yet active', 403)
  }

  if (link.expires_at && new Date(link.expires_at) < now) {
    return deny('This link has expired', 410)
  }

  // Atomically gate against max_clicks and increment the counter. Using an RPC
  // with a row lock avoids lost-update races under concurrent clicks.
  const { data: recorded, error: rpcError } = await supabase.rpc('record_click', {
    p_link_id: link.id,
  })
  if (rpcError) {
    console.error('record_click error:', rpcError.message)
  }
  if (recorded === false) {
    return deny('This link has reached its maximum number of clicks', 403)
  }

  const info = parseClientInfo(request)
  const userAgent = request.headers.get('user-agent') || ''

  try {
    await supabase.from('click_analytics').insert([
      {
        link_id: link.id,
        user_id: link.user_id,
        device_type: info.device_type,
        browser: info.browser,
        os: info.os,
        referer: info.referer,
        referer_domain: info.refererDomain,
        clicked_at: now.toISOString(),
        // Raw IP and UA are never stored: the IP is one-way hashed and the
        // full UA string is dropped (parsed device/browser/os are kept).
        ip_address: info.ipHash,
        user_agent: null,
        success: true,
        visitor_id: generateVisitorId(info.ipHash, userAgent),
        language: info.language,
      },
    ])
  } catch (e) {
    console.error('Error tracking click:', e)
  }

  if (link.monetize !== false) {
    const safeUrl = toScriptString(link.original_url)
    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Loading your link...</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="robots" content="noindex, nofollow">
          <meta name="referrer" content="no-referrer">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: linear-gradient(135deg, #0f766e 0%, #164e63 100%);
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
            <h1 style="font-size:1.5rem;margin:0 0 0.5rem;">Preparing your link</h1>
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
                window.location.href = ${safeUrl};
              }
            }, 1000);
          </script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'no-referrer',
        },
      }
    )
  }

  return NextResponse.redirect(link.original_url, 302)
}

async function loadLink(shortCode: string) {
  const { data, error } = await supabase
    .from('links')
    .select(
      'id, user_id, short_code, original_url, password_hash, is_active, scheduled_at, expires_at, monetize'
    )
    .eq('short_code', shortCode)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    if (!shortCode) {
      return new NextResponse('Short code is required', { status: 400 })
    }

    const link = await loadLink(shortCode)
    if (!link) return new NextResponse('Link not found', { status: 404 })

    // Passwords are only accepted via POST; GET never carries a secret in the
    // query string (avoids password leakage through logs/history/referrer).
    if (link.password_hash) {
      return passwordPage({ shortCode, error: false })
    }

    return redirectFlow(request, link)
  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params

  const formData = await request.formData().catch(() => null)
  const password =
    typeof formData?.get('password') === 'string' ? (formData.get('password') as string) : ''

  const link = await loadLink(shortCode)
  if (!link) return new NextResponse('Link not found', { status: 404 })

  if (link.password_hash) {
    if (!password) return passwordPage({ shortCode, error: false })
    const isValid = await bcrypt.compare(password, link.password_hash)
    if (!isValid) return passwordPage({ shortCode, error: true })
  }

  return redirectFlow(request, link)
}
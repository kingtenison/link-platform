import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(
  ip: string,
  limit: number = 100,
  windowMs: number = 60_000
): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  entry.count++
  if (entry.count > limit) return false
  return true
}

function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

let lastCleanup = Date.now()
function maybeCleanup() {
  const now = Date.now()
  if (now - lastCleanup > 60_000) {
    lastCleanup = now
    cleanupRateLimitStore()
  }
}

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/favicon.ico',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/links/shorten',
]

const DEBUG_PATHS = [
  '/debug',
  '/test-analytics',
]

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/api/links',
  '/api/analytics',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isDebugPath(pathname: string): boolean {
  return DEBUG_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  maybeCleanup()

  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (process.env.NODE_ENV === 'production' && isDebugPath(pathname)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  if (!checkRateLimit(ip, 200, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/reset-password')
  ) {
    if (!checkRateLimit(`auth:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  }

  // Password-protected short links submit via POST to /{shortCode}; slow down
  // brute-force attempts per IP without affecting normal GET redirects.
  if (
    request.method === 'POST' &&
    /^\/[^/]+$/.test(pathname) &&
    !isPublicPath(pathname) &&
    !pathname.startsWith('/api/')
  ) {
    const allowed = checkRateLimit(`pwl:${ip}`, 30, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // CSRF defense-in-depth: for state-changing non-GET API calls, reject
  // requests whose Origin/Referer host does not match this deployment.
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    pathname.startsWith('/api/')
  ) {
    const host = request.headers.get('host')
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    if (host) {
      if (origin) {
        let originHost = ''
        try {
          originHost = new URL(origin).host
        } catch {
          return new NextResponse('Invalid Origin', { status: 403 })
        }
        if (originHost !== host) {
          return new NextResponse('Cross-site request rejected', { status: 403 })
        }
      } else if (referer) {
        let refererHost = ''
        try {
          refererHost = new URL(referer).host
        } catch {
          return new NextResponse('Invalid Referer', { status: 403 })
        }
        if (refererHost !== host) {
          return new NextResponse('Cross-site request rejected', { status: 403 })
        }
      }
    }
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  // --- Supabase Auth session check ---
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callback', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|llms\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

export interface ApiLink {
  id: string
  user_id: string
  short_code: string
  original_url: string
  title: string | null
  clicks_count: number
  created_at: string
  updated_at: string | null
  is_active: boolean
  expires_at: string | null
  max_clicks: number | null
  hasPassword: boolean
  scheduled_at: string | null
  timezone: string | null
  protection_type: string[] | null
  last_clicked_at: string | null
  monetize: boolean
}

export interface ApiClick {
  id: string
  link_id: string
  device_type: string | null
  browser: string | null
  os: string | null
  referer: string | null
  referer_domain: string | null
  clicked_at: string
  visitor_id: string | null
  language: string | null
  success: boolean | null
  country: string | null
  city: string | null
}

// Columns that must never leave the server on the wire. The service-role key
// bypasses RLS, so route handlers must strip these themselves.
const LINK_SENSITIVE_FIELDS = ['password_hash'] as const

export function toSafeLink<T extends Record<string, unknown>>(link: T) {
  const safe = { ...link } as Record<string, unknown>
  for (const field of LINK_SENSITIVE_FIELDS) {
    delete safe[field]
  }
  safe.hasPassword = Boolean((link as { password_hash?: string | null }).password_hash)
  return safe as unknown as ApiLink
}

// Explicit, non-sensitive projection for click analytics reads.
export const CLICK_SAFE_COLUMNS =
  'id, link_id, device_type, browser, os, referer, referer_domain, clicked_at, visitor_id, language, success, country, city'

export function cleanReferer(referer: string | null): string {
  if (!referer || referer === 'direct') return 'direct'
  try {
    const url = new URL(referer)
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '') || 'direct'
  } catch {
    return 'direct'
  }
}

export function parseClientInfo(request: NextRequest): {
  ip: string
  ipHash: string
  device_type: string
  browser: string
  os: string
  referer: string
  refererDomain: string
  language: string
} {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'

  const rawReferer = request.headers.get('referer') || 'direct'
  let refererDomain = 'direct'
  if (rawReferer !== 'direct') {
    try {
      const parsed = new URL(rawReferer)
      if (parsed.hostname === request.headers.get('host')) {
        refererDomain = 'internal'
      } else {
        refererDomain = parsed.hostname
      }
    } catch {
      refererDomain = 'unknown'
    }
  }

  const ua = request.headers.get('user-agent') || ''

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

  return {
    ip,
    ipHash: hashIp(ip),
    device_type,
    browser,
    os,
    referer: cleanReferer(rawReferer),
    refererDomain,
    language: request.headers.get('accept-language')?.split(',')[0]?.trim() || 'en-US',
  }
}

// One-way hash for storing visitor IPs so raw addresses never hit the database.
export function hashIp(ip: string): string {
  const pepper = process.env.APP_SECRET
  if (!pepper) {
    console.warn('APP_SECRET not set — using fallback for IP hashing. Set APP_SECRET in production.')
  }
  const sanitized = ip.split(':')[0] // strip IPv6 port if present
  return createHash('sha256').update(`${sanitized}::${pepper || 'linkplatform-dev'}`).digest('hex')
}

// The proxy middleware verifies the JWT and injects x-user-id for protected routes.
export function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

export function unauthorized(reason = 'Authentication required') {
  return NextResponse.json({ error: reason }, { status: 401 })
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 })
}

export function notFound(error = 'Not found') {
  return NextResponse.json({ error }, { status: 404 })
}
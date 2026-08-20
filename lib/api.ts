import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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
  password_hash: string | null
  scheduled_at: string | null
  timezone: string | null
  protection_type: string[] | null
  last_clicked_at: string | null
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
  ip_address: string | null
  user_agent: string | null
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
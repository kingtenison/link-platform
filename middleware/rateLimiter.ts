import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function rateLimiter(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  const userRateLimit = rateLimit.get(ip) || { count: 0, resetTime: now + windowMs }
  
  if (now > userRateLimit.resetTime) {
    userRateLimit.count = 0
    userRateLimit.resetTime = now + windowMs
  }
  
  userRateLimit.count++
  rateLimit.set(ip, userRateLimit)
  
  if (userRateLimit.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    )
  }
  
  return null
}

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateShortCode, validateUrl, ensureProtocol } from '@/utils/shortener'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const {
      url,
      customAlias,
      password,
      expiresAt,
      maxClicks,
      scheduledAt,
      timezone,
    } = await request.json()

    if (!validateUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = await verifyToken(token)

    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const cleanUrl = ensureProtocol(url)
    let shortCode = customAlias || generateShortCode()

    if (customAlias) {
      const { data: existing } = await supabase
        .from('links')
        .select('short_code')
        .eq('short_code', customAlias)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Custom alias already taken' },
          { status: 400 }
        )
      }
    } else {
      let isUnique = false
      let attempts = 0
      while (!isUnique && attempts < 5) {
        const { data: existing } = await supabase
          .from('links')
          .select('short_code')
          .eq('short_code', shortCode)
          .single()

        if (!existing) {
          isUnique = true
        } else {
          shortCode = generateShortCode()
          attempts++
        }
      }
    }

    const protectionTypes: string[] = []
    const insertData: Record<string, unknown> = {
      short_code: shortCode,
      original_url: cleanUrl,
      user_id: userId,
      title: new URL(cleanUrl).hostname,
      clicks_count: 0,
      is_active: true,
      protection_type: protectionTypes,
    }

    if (password && password.trim() !== '') {
      insertData.password_hash = await bcrypt.hash(password, 10)
      protectionTypes.push('password')
    }

    if (expiresAt) {
      insertData.expires_at = new Date(expiresAt).toISOString()
      protectionTypes.push('expiration')
    }

    if (maxClicks && parseInt(maxClicks) > 0) {
      insertData.max_clicks = parseInt(maxClicks)
      protectionTypes.push('max_clicks')
    }

    if (scheduledAt) {
      insertData.scheduled_at = new Date(scheduledAt).toISOString()
      insertData.timezone = timezone || 'UTC'
      protectionTypes.push('scheduled')
      insertData.is_active = false
    }

    const { data: link, error } = await supabase
      .from('links')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      shortCode: link.short_code,
      shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${link.short_code}`,
      originalUrl: link.original_url,
      protection: link.protection_type,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

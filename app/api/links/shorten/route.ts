import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/service'
import { generateShortCode, validateUrl, ensureProtocol } from '@/utils/shortener'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
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
      monetize,
    } = await request.json()

    if (!validateUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (password && password.length > 72) {
      return NextResponse.json({ error: 'Password must be 72 characters or fewer' }, { status: 400 })
    }

    // Authentication is optional: logged-in users own their links,
    // anonymous visitors can shorten instantly (user_id = null).
    let userId: string | null = null
    const cookieStore = await cookies()

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (user) {
      userId = user.id
    }

    const cleanUrl = ensureProtocol(url)
    let shortCode = customAlias || generateShortCode()

    if (customAlias) {
      if (!/^[a-zA-Z0-9]{3,60}$/.test(customAlias)) {
        return NextResponse.json(
          { error: 'Custom alias must be 3-60 characters using only letters and numbers' },
          { status: 400 }
        )
      }
      shortCode = customAlias

      const { data: existing } = await supabase
        .from('links')
        .select('short_code')
        .eq('short_code', customAlias)
        .maybeSingle()

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
      monetize: monetize === false ? false : true,
    }

    if (password && password.trim() !== '') {
      insertData.password_hash = await bcrypt.hash(password, 10)
      protectionTypes.push('password')
    }

    if (expiresAt) {
      const expiry = new Date(expiresAt)
      if (Number.isNaN(expiry.getTime())) {
        return NextResponse.json({ error: 'Invalid expiry date' }, { status: 400 })
      }
      insertData.expires_at = expiry.toISOString()
      protectionTypes.push('expiration')
    }

    if (maxClicks && parseInt(maxClicks) > 0) {
      insertData.max_clicks = parseInt(maxClicks)
      protectionTypes.push('max_clicks')
    }

    if (scheduledAt) {
      const scheduled = new Date(scheduledAt)
      if (Number.isNaN(scheduled.getTime())) {
        return NextResponse.json({ error: 'Invalid schedule date' }, { status: 400 })
      }
      insertData.scheduled_at = scheduled.toISOString()
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
      console.error('Shorten insert error:', error)
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
    }

    return NextResponse.json({
      shortCode: link.short_code,
      shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${link.short_code}`,
      originalUrl: link.original_url,
      protection: link.protection_type,
      anonymous: userId === null,
    })
  } catch (err) {
    console.error('Shorten error details:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

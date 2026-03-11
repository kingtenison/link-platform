import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateShortCode, validateUrl, ensureProtocol } from '@/utils/shortener'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  console.log('>>> Shorten API called with protection')
  
  try {
    const { 
      url, 
      customAlias, 
      password, 
      expiresAt, 
      maxClicks,
      scheduledAt,
      timezone 
    } = await request.json()
    
    console.log('>>> Protection data received:', { 
      hasPassword: !!password, 
      expiresAt, 
      maxClicks,
      scheduledAt 
    })

    // Validate URL
    if (!validateUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    // Get user from token
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    let userId = null
    if (token) {
      userId = await verifyToken(token)
    }

    const cleanUrl = ensureProtocol(url)
    let shortCode = customAlias || generateShortCode()

    // Check if custom alias is available
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
      // Ensure generated code is unique
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

    // Prepare insert data
    const insertData: any = {
      short_code: shortCode,
      original_url: cleanUrl,
      user_id: userId,
      title: new URL(cleanUrl).hostname,
      clicks_count: 0,
      is_active: true,
      protection_type: []
    }

    // Add password protection
    if (password && password.trim() !== '') {
      insertData.password_hash = await bcrypt.hash(password, 10)
      insertData.protection_type.push('password')
      console.log('>>> Password protection added')
    }

    // Add expiration
    if (expiresAt) {
      insertData.expires_at = new Date(expiresAt).toISOString()
      insertData.protection_type.push('expiration')
      console.log('>>> Expiration added:', expiresAt)
    }

    // Add max clicks
    if (maxClicks && parseInt(maxClicks) > 0) {
      insertData.max_clicks = parseInt(maxClicks)
      insertData.protection_type.push('max_clicks')
      console.log('>>> Max clicks added:', maxClicks)
    }

    // Add scheduling
    if (scheduledAt) {
      insertData.scheduled_at = new Date(scheduledAt).toISOString()
      insertData.timezone = timezone || 'UTC'
      insertData.protection_type.push('scheduled')
      insertData.is_active = false // Start inactive until scheduled
      console.log('>>> Scheduling added:', scheduledAt)
    }

    console.log('>>> Insert data:', insertData)

    const { data: link, error } = await supabase
      .from('links')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('>>> Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      shortCode: link.short_code,
      shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${link.short_code}`,
      originalUrl: link.original_url,
      protection: link.protection_type
    })

  } catch (error) {
    console.error('>>> Shorten API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserId, unauthorized, notFound, badRequest } from '@/lib/api'
import { ensureProtocol, validateUrl, generateShortCode } from '@/utils/shortener'
import bcrypt from 'bcryptjs'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request)
  if (!userId) return unauthorized()

  const { id } = await params

  const { data: link, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !link) return notFound('Link not found')
  return NextResponse.json({ link })
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request)
  if (!userId) return unauthorized()

  const { id } = await params

  const { data: link, error: fetchError } = await supabase
    .from('links')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError || !link) return notFound('Link not found')

  // Delete dependent analytics first (avoids FK constraint failures)
  await supabase.from('click_analytics').delete().eq('link_id', id)

  const { error } = await supabase.from('links').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const userId = getUserId(request)
  if (!userId) return unauthorized()

  const { id } = await params

  const { data: link, error: fetchError } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError || !link) return notFound('Link not found')

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return badRequest('Invalid request body')

  const updates: Record<string, unknown> = {}
  const protectionTypes = new Set<string>(link.protection_type || [])

  if (typeof body.url === 'string' && body.url.trim() !== '') {
    if (!validateUrl(body.url)) return badRequest('Invalid URL')
    updates.original_url = ensureProtocol(body.url)
    updates.title = new URL(updates.original_url as string).hostname
  }

  if (typeof body.customAlias === 'string' && body.customAlias.trim() !== '') {
    const alias = body.customAlias.replace(/[^a-zA-Z0-9]/g, '')
    if (alias && alias !== link.short_code) {
      const { data: existing } = await supabase
        .from('links')
        .select('short_code')
        .eq('short_code', alias)
        .neq('id', id)
        .maybeSingle()

      if (existing) return badRequest('Custom alias already taken')
      updates.short_code = alias
    }
  }

  if (typeof body.password === 'string' && body.password.trim() !== '') {
    updates.password_hash = await bcrypt.hash(body.password, 10)
    protectionTypes.add('password')
  }

  if (typeof body.expiresAt === 'string' && body.expiresAt) {
    updates.expires_at = new Date(body.expiresAt).toISOString()
    protectionTypes.add('expiration')
  } else if (body.expiresAt === null || body.expiresAt === '') {
    updates.expires_at = null
    protectionTypes.delete('expiration')
  }

  if (typeof body.maxClicks === 'string' && body.maxClicks !== '') {
    const parsed = parseInt(body.maxClicks)
    if (!Number.isNaN(parsed) && parsed > 0) {
      updates.max_clicks = parsed
      protectionTypes.add('max_clicks')
    }
  } else if (body.maxClicks === null || body.maxClicks === '') {
    updates.max_clicks = null
    protectionTypes.delete('max_clicks')
  }

  if (typeof body.scheduledAt === 'string' && body.scheduledAt) {
    updates.scheduled_at = new Date(body.scheduledAt).toISOString()
    updates.timezone = body.timezone || 'UTC'
    protectionTypes.add('scheduled')
    updates.is_active = false
  } else if (body.scheduledAt === null || body.scheduledAt === '') {
    updates.scheduled_at = null
    protectionTypes.delete('scheduled')
  }

  if (typeof body.isActive === 'boolean') {
    updates.is_active = body.isActive
  }

  if (typeof body.shortCode === 'string' && body.shortCode === '') {
    updates.short_code = generateShortCode()
  }

  updates.protection_type = Array.from(protectionTypes)
  updates.updated_at = new Date().toISOString()

  const { data: updated, error } = await supabase
    .from('links')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
  }

  return NextResponse.json({ link: updated })
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserId, unauthorized } from '@/lib/api'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = request.nextUrl
  const linkId = searchParams.get('linkId')
  const range = searchParams.get('range')

  // Fetch user's links for the dropdown
  const { data: linksData, error: linksError } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (linksError) {
    return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 })
  }

  // Build clicks query scoped to the user's own clicks
  let query = supabase
    .from('click_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('clicked_at', { ascending: false })

  if (linkId && linkId !== 'all') {
    query = query.eq('link_id', linkId)
  }

  if (range && range !== 'all') {
    const days = { '7d': 7, '30d': 30, '90d': 90 }[range]
    if (days) {
      query = query.gte('clicked_at', subDays(new Date(), days).toISOString())
    }
  }

  const { data: clicksData, error: clicksError } = await query

  if (clicksError) {
    return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 })
  }

  return NextResponse.json({
    links: linksData || [],
    clicks: clicksData || [],
  })
}
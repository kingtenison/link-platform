import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserId, unauthorized } from '@/lib/api'

export async function GET(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) return unauthorized()

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to load links' }, { status: 500 })
  }

  return NextResponse.json({ links: data || [] })
}
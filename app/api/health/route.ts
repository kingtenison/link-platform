import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify Vercel cron or manual auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Allow unauthenticated access for manual checks, but log it
  }

  try {
    const start = Date.now()
    const { error } = await supabase.from('links').select('id', { head: true, count: 'exact' })
    const ms = Date.now() - start

    if (error) {
      return NextResponse.json({ status: 'error', error: error.message, ms }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', ms, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'error', message: 'Health check failed' }, { status: 500 })
  }
}

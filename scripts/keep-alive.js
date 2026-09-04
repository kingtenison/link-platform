/**
 * Supabase Keep-Alive Script
 *
 * Prevents Supabase free-tier projects from pausing after 7 days of inactivity.
 *
 * Usage:
 *   node scripts/keep-alive.js
 *
 * Environment:
 *   NEXT_PUBLIC_APP_URL  — your deployed app URL (e.g. https://linkplatform.vercel.app)
 *
 * Recommended schedule: run every 6 days via cron-job.org or any scheduler.
 */

const URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`

async function ping() {
  try {
    const res = await fetch(URL)
    const data = await res.json()
    console.log(`[${new Date().toISOString()}] Health: ${data.status} (${data.ms}ms)`)
    process.exit(data.status === 'ok' ? 0 : 1)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Failed:`, err.message)
    process.exit(1)
  }
}

ping()

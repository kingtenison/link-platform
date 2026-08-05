import * as Sentry from '@sentry/nextjs'

let initialized = false

export function initSentry() {
  if (initialized) return
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
    initialized = true
  }
}

export function logError(error: any, context?: any) {
  console.error('Error:', error, context)
  
  if (process.env.NODE_ENV === 'production' && initialized) {
    Sentry.captureException(error, { extra: context })
  }
}

export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]:`, message)
  
  if (process.env.NODE_ENV === 'production' && initialized) {
    Sentry.captureMessage(message, level)
  }
}

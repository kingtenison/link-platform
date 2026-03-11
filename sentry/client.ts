import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    })
  }
}

export function logError(error: any, context?: any) {
  console.error('Error:', error, context)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
  }
}

export function logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]:`, message)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level)
  }
}

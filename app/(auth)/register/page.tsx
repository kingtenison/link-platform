'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiBarChart2, FiZap, FiShield, FiLink, FiCheckCircle } from 'react-icons/fi'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleRegister() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  const benefits = [
    { icon: FiLink, text: 'Shorten unlimited links — 100% free' },
    { icon: FiBarChart2, text: 'Detailed real-time click analytics' },
    { icon: FiZap, text: 'Instant QR code generation' },
    { icon: FiShield, text: 'Privacy-first & secure by design' },
  ]

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">

        {/* Mobile / Tablet Top Branding */}
        <div className="lg:hidden mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent">L</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-2xl text-white tracking-tight">LinkPlatform</div>
              <div className="text-white/70 text-xs -mt-0.5">Smart URL Shortener</div>
            </div>
          </div>
          <p className="text-white/90 text-sm">
            Join 1.5M+ users. Start shortening links and tracking analytics in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">

          {/* Desktop Guiding Info Panel */}
          <div className="hidden lg:block text-white space-y-8 px-2 lg:pr-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent">L</span>
                </div>
                <div>
                  <div className="font-bold text-2xl tracking-tight">LinkPlatform</div>
                  <div className="text-white/70 text-sm -mt-0.5">Smart URL Shortener</div>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tighter">
                Start shortening<br />in seconds.
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Create your free account and join over 1.5 million users who use LinkPlatform to share smarter, track better, and grow faster.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="mt-0.5 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-white/95 text-[15px] leading-snug pt-1.5">{benefit.text}</div>
                  </div>
                )
              })}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white/90">
              <FiCheckCircle className="w-4 h-4" />
              <span>No credit card required. Cancel anytime.</span>
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card w-full max-w-lg mx-auto lg:mx-0 p-7 sm:p-8 lg:p-9 xl:p-10 2xl:p-12"
          >
            <div className="mb-7 lg:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Create your account</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm sm:text-base">Sign up with your Google account to get started</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 sm:p-3.5 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900"
              >
                {error}
              </motion.div>
            )}

            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="white-btn w-full justify-center py-3 sm:py-3.5 text-base gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-b-transparent" />
                  Redirecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>

            <div className="mt-7 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </motion.div>

        </div>

        {/* Mobile Benefits */}
        <div className="lg:hidden mt-8 max-w-lg mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 text-white">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-white/95 leading-tight">{benefit.text}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center mt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs text-white/90">
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>No credit card required. Cancel anytime.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

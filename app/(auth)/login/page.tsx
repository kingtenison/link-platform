'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiBarChart2, FiLink, FiShield, FiZap, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('registered') === 'true' 
        ? 'Account created successfully! Please sign in.' 
        : ''
    }
    return ''
  })
  const [loading, setLoading] = useState(false)

  // Clean the URL once after showing the success message
  useEffect(() => {
    if (successMessage && searchParams.get('registered') === 'true') {
      window.history.replaceState({}, '', '/login')
    }
  }, [successMessage, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  const benefits = [
    { icon: FiBarChart2, text: 'Real-time analytics & insights' },
    { icon: FiLink, text: 'Manage all your links in one place' },
    { icon: FiZap, text: 'Lightning fast global redirects' },
    { icon: FiShield, text: 'Enterprise-grade security' },
  ]

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        
        {/* Mobile / Tablet Top Branding (hidden on large screens) */}
        <div className="lg:hidden mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">L</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-2xl text-white tracking-tight">LinkPlatform</div>
              <div className="text-white/70 text-xs -mt-0.5">Smart URL Shortener</div>
            </div>
          </div>
          <p className="text-white/90 text-sm">
            Welcome back. Sign in to manage your links and view analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* Desktop Guiding Info Panel (hidden on mobile) */}
          <div className="hidden lg:block text-white space-y-8 px-2 lg:pr-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">L</span>
                </div>
                <div>
                  <div className="font-bold text-2xl tracking-tight">LinkPlatform</div>
                  <div className="text-white/70 text-sm -mt-0.5">Smart URL Shortener</div>
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tighter">
                Welcome back.
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Sign in to access your dashboard, view powerful analytics, and manage every shortened link you&apos;ve created.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="mt-0.5 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="text-white/95 text-[15px] leading-snug pt-1.5">{benefit.text}</div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 text-sm text-white/70">
              Trusted by over <span className="font-medium text-white">1.5 million</span> users worldwide
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
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Sign in</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm sm:text-base">Enter your credentials to continue</p>
            </div>

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 p-3 sm:p-3.5 rounded-xl mb-6 text-sm border border-emerald-100 dark:border-emerald-900 flex items-center gap-2 overflow-hidden"
                >
                  <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                  {successMessage}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 sm:p-3.5 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-white pl-12 py-3 sm:py-3.5 text-base"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-white pl-12 pr-12 py-3 sm:py-3.5 text-base"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex justify-end -mt-1 mb-1">
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="white-btn w-full justify-center py-3 sm:py-3.5 text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-b-transparent mr-2" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <FiArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Create one for free
                </Link>
              </p>
            </div>
          </motion.div>

        </div>

        {/* Mobile / Tablet Bottom Benefits Section (hidden on large screens) */}
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
          <p className="text-center mt-4 text-xs text-white/70">
            Trusted by over <span className="font-medium text-white">1.5 million</span> users
          </p>
        </div>

      </div>
    </div>
  )
}


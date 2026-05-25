'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiArrowRight, FiBarChart2, FiZap, FiShield, FiLink, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(email, password, name)
      router.push('/login?registered=true')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
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
            Join 1.5M+ users. Start shortening links and tracking analytics in seconds.
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
                      <Icon className="w-4.5 h-4.5" />
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
              <p className="text-gray-600 dark:text-gray-400 mt-1.5 text-sm sm:text-base">It only takes a minute to get started</p>
            </div>

            <AnimatePresence>
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
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-white pl-12 py-3 sm:py-3.5 text-base"
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-white pl-12 pr-12 py-3 sm:py-3.5 text-base"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
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
              <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-1 pl-1">
                Minimum 6 characters
              </p>

              <button
                type="submit"
                disabled={loading}
                className="white-btn w-full justify-center py-3 sm:py-3.5 text-base mt-1.5"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-b-transparent mr-2" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create free account
                    <FiArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                  Sign in instead
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


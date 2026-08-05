'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      // Always show success to prevent email enumeration
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="mb-6">
          <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4">
            <FiArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
          <h2 className="text-2xl font-bold gradient-text">Reset password</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <FiCheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Check your email</h3>
            <p className="text-gray-500 text-sm mb-6">
              If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <Link
              href="/login"
              className="white-btn inline-flex"
            >
              Return to login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-white pl-12"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="white-btn w-full justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-b-transparent" />
              ) : (
                <>
                  Send reset link
                  <FiArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      // Login function already handles redirect
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-white pl-10"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-white pl-10"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="white-btn w-full justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  )
}

'use client'

import Link from 'next/link'
import { FiHome, FiArrowLeft, FiLink } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8">
          <FiLink className="w-12 h-12 text-white" />
        </div>

        <div>
          <h1 className="text-8xl font-bold text-white/20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-3">Page not found</h2>
          <p className="text-lg text-white/70 mb-10">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            If this was a short link, it may have expired or been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

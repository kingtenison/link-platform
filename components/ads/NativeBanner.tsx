'use client'

import { useEffect } from 'react'

export default function NativeBanner() {
  useEffect(() => {
    // Load the ad script
    const script = document.createElement('script')
    script.src = "https://pl28900393.effectivegatecpm.com/1b53510b235d00c949b3553d91ab83b8/invoke.js"
    script.async = true
    script.setAttribute('data-cfasync', 'false')
    document.body.appendChild(script)

    return () => {
      try {
        document.body.removeChild(script)
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [])

  return (
    <div className="my-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-2 text-sm text-gray-600 dark:text-gray-400">
        Advertisement
      </div>
      <div id="container-1b53510b235d00c949b3553d91ab83b8">
        {/* Ad will render here */}
      </div>
    </div>
  )
}

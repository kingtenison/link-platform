'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  FiLink, 
  FiLock, 
  FiCalendar, 
  FiArrowLeft, 
  FiShield, 
  FiCopy, 
  FiCheck,
  FiClock,
  FiZap,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiAlertCircle
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import type { ApiLink } from '@/lib/api'
import toast from 'react-hot-toast'
import PageTitle from '@/components/ui/PageTitle'

function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function NewLinkContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editingId = searchParams.get('edit')

  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)
  const [shortUrl, setShortUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load link when editing
  useEffect(() => {
    let cancelled = false
    if (editingId && user) {
      fetch(`/api/links/${editingId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled || !data?.link) return
          const link: ApiLink = data.link
          setUrl(link.original_url)
          setCustomAlias(link.short_code)
          setMaxClicks(link.max_clicks != null ? String(link.max_clicks) : '')
          setExpiresAt(link.expires_at ? toLocalInputValue(link.expires_at) : '')
          setScheduledAt(link.scheduled_at ? toLocalInputValue(link.scheduled_at) : '')
          if (link.timezone) setTimezone(link.timezone)
        })
        .catch(() => {
          toast.error('Failed to load link')
        })
    }
    return () => {
      cancelled = true
    }
  }, [editingId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const endpoint = editingId ? `/api/links/${editingId}` : '/api/links/shorten'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          customAlias,
          password: password || undefined,
          expiresAt: expiresAt || undefined,
          maxClicks: maxClicks || undefined,
          scheduledAt: scheduledAt || undefined,
          timezone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save link')
      }

      if (editingId) {
        toast.success('Link updated successfully!')
        router.push('/dashboard/links')
        router.refresh()
        return
      }

      setShortUrl(data.shortUrl)
      setCreated(true)
      toast.success('Link created successfully!')
      
      // Show protection summary
      if (data.protection && data.protection.length > 0) {
        toast.success(`Protected with: ${data.protection.join(', ')}`)
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const createAnother = () => {
    setCreated(false)
    setUrl('')
    setCustomAlias('')
    setPassword('')
    setExpiresAt('')
    setMaxClicks('')
    setScheduledAt('')
  }

  if (created) {
    return (
      <div className="dashboard-container">
        <PageTitle title="Link Created" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6"
          >
            <FiCheck className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold gradient-text mb-2">Link Created!</h1>
          <p className="text-gray-600 mb-6">Your protected link is ready to use</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="w-full min-w-0 flex-1 bg-transparent text-gray-600 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="white-btn min-w-[100px]"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createAnother}
              className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600"
            >
              Create Another
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/links')}
              className="white-btn"
            >
              View All Links
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
      <PageTitle title={editingId ? 'Edit Link' : 'Create Link'} />
      <Link href="/dashboard/links" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-8 group">
        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Links
      </Link>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {editingId ? 'Edit Link' : 'Create Protected Link'}
        </h1>
        <p className="text-gray-600 mb-6">
          {editingId
            ? 'Update the security and control settings for this link'
            : 'Add security and control to your shortened links'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'basic' ? 'text-teal-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Basic Info
            {activeTab === 'basic' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('protection')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'protection' ? 'text-teal-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiShield className="inline w-4 h-4 mr-1" />
            Protection
            {activeTab === 'protection' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'schedule' ? 'text-teal-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiClock className="inline w-4 h-4 mr-1" />
            Schedule
            {activeTab === 'schedule' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <motion.div
                key="basic"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/your-long-url"
                      className="input-white pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Custom Alias (optional)
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2 bg-gray-100 px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 text-sm truncate max-w-[45%]">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/
                    </span>
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="my-custom-link"
                      className="input-white rounded-l-none min-w-0 flex-1"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only letters and numbers allowed</p>
                </div>
              </motion.div>
            )}

            {/* Protection Tab */}
            {activeTab === 'protection' && (
              <motion.div
                key="protection"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-6"
              >
                {/* Password Protection */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiLock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="link-password">
                        Password Protection
                      </label>
                      <div className="relative">
                        <input
                          id="link-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={editingId ? 'Leave empty to keep current password' : 'Set password to protect this link'}
                          className="input-white pr-10"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Users will need a password to access this link</p>
                    </div>
                  </div>
                </div>

                {/* Max Clicks */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiZap className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="link-max-clicks">
                        Maximum Clicks
                      </label>
                      <input
                        id="link-max-clicks"
                        type="number"
                        value={maxClicks}
                        onChange={(e) => setMaxClicks(e.target.value)}
                        placeholder="e.g., 1000"
                        min="1"
                        className="input-white"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Link will auto-deactivate after this many clicks</p>
                    </div>
                  </div>
                </div>

                {/* Expiration */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="link-expires">
                        Expiration Date
                      </label>
                      <input
                        id="link-expires"
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="input-white"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Link will expire on this date</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="link-schedule">
                        Schedule Link Activation
                      </label>
                      <input
                        id="link-schedule"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="input-white mb-2"
                        disabled={loading}
                      />
                      
                      <div className="flex items-center gap-2">
                        <FiGlobe className="w-4 h-4 text-gray-400" />
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="text-sm text-gray-600 bg-transparent border-none focus:ring-0"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Asia/Shanghai">Shanghai</option>
                          <option value="Australia/Sydney">Sydney</option>
                        </select>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Link will automatically go live at the specified time
                      </p>
                    </div>
                  </div>
                </div>

                {scheduledAt && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-start gap-2">
                    <FiAlertCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-teal-800">
                      This link will be inactive until {new Date(scheduledAt).toLocaleString()}. 
                      It will automatically start working at the scheduled time.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full white-btn py-4 text-lg mt-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mr-2"></div>
                {editingId ? 'Saving Changes...' : 'Creating Protected Link...'}
              </>
            ) : (
              <>
                <FiShield className="w-5 h-5 mr-2" />
                {editingId ? 'Save Changes' : 'Create Protected Link'}
              </>
            )}
          </motion.button>
        </form>

        {/* Protection Summary */}
        {(password || maxClicks || expiresAt || scheduledAt) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm text-green-800 flex items-center">
              <FiShield className="w-4 h-4 mr-2" />
              This link will be protected with:
              {password && '  Password'}
              {maxClicks && `  Max ${maxClicks} clicks`}
              {expiresAt && `  Expires ${new Date(expiresAt).toLocaleDateString()}`}
              {scheduledAt && `  Scheduled for ${new Date(scheduledAt).toLocaleDateString()}`}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default function NewLinkPage() {
  return (
    <Suspense fallback={null}>
      <NewLinkContent />
    </Suspense>
  )
}
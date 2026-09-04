'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, Suspense, useLayoutEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ApiLink } from '@/lib/api'
import Link from 'next/link'
import { 
  FiDownload, 
  FiCopy, 
  FiExternalLink, 
  FiSearch,
  FiRefreshCw,
  FiGrid,
  FiArrowLeft,
  FiCheck,
  FiDownloadCloud,
  FiEye,
  FiCode,
  FiX,
  FiLink as FiLinkIcon
} from 'react-icons/fi'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'
import PageTitle from '@/components/ui/PageTitle'

function QRCodesContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [links, setLinks] = useState<ApiLink[]>([])
  const [filteredLinks, setFilteredLinks] = useState<ApiLink[]>([])
  const [selectedLink, setSelectedLink] = useState<ApiLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(256)
  const [showPreview, setShowPreview] = useState(false)
  const qrBoxRef = useRef<HTMLDivElement>(null)
  const previewBoxRef = useRef<HTMLDivElement>(null)
  const [qrBoxWidth, setQrBoxWidth] = useState(0)
  const [previewBoxWidth, setPreviewBoxWidth] = useState(0)

  useLayoutEffect(() => {
    if (!qrBoxRef.current) return
    const measure = () => setQrBoxWidth(qrBoxRef.current?.clientWidth ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(qrBoxRef.current)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (!showPreview || !previewBoxRef.current) return
    const measure = () => setPreviewBoxWidth(previewBoxRef.current?.clientWidth ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(previewBoxRef.current)
    return () => ro.disconnect()
  }, [showPreview])

  const closePreview = useCallback(() => setShowPreview(false), [])

  useEffect(() => {
    if (!showPreview) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showPreview, closePreview])

  const displayQrSize = qrBoxWidth > 0 ? Math.min(qrSize, Math.max(128, qrBoxWidth - 64)) : qrSize
  const previewQrSize = previewBoxWidth > 0 ? Math.min(400, Math.max(128, previewBoxWidth - 64)) : 400

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchLinks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = links.filter(link => 
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredLinks(filtered)
    } else {
      setFilteredLinks(links)
    }
  }, [searchTerm, links])

  // Preselect link from ?link= param
  useEffect(() => {
    const linkId = searchParams.get('link')
    if (linkId && links.length > 0) {
      const match = links.find(l => l.id === linkId)
      if (match) setSelectedLink(match)
    }
  }, [searchParams, links])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')
      if (!res.ok) throw new Error('Failed to load links')
      const data = await res.json()
      const fetched: ApiLink[] = data.links || []
      setLinks(fetched)
      setFilteredLinks(fetched)
      
      // Auto-select first link if available
      if (fetched.length > 0 && !selectedLink) {
        const linkId = searchParams.get('link')
        const match = linkId ? fetched.find(l => l.id === linkId) : undefined
        setSelectedLink(match || fetched[0])
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Failed to load links')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = async () => {
    if (!selectedLink) return
    
    setDownloading(true)
    try {
      const svg = document.getElementById('qr-code')
      if (!svg) return
      
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = qrSize
        canvas.height = qrSize
        ctx?.drawImage(img, 0, 0, qrSize, qrSize)
        const pngFile = canvas.toDataURL('image/png')
        
        const downloadLink = document.createElement('a')
        downloadLink.download = `qrcode-${selectedLink.short_code}.png`
        downloadLink.href = pngFile
        downloadLink.click()
        
        toast.success('QR Code downloaded!')
        setDownloading(false)
      }
      
img.src = 'data:image/svg+xml,' + encodeURIComponent(svgData)
    } catch {
      toast.error('Failed to download QR code')
      setDownloading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const getFullUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
<div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 space-y-12 sm:space-y-16 lg:space-y-20">
      <PageTitle title="QR Codes" />
      {/* Header with Navigation */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">QR Code Generator</h1>
            <p className="text-gray-600 mt-1">
              Generate beautiful QR codes for your shortened links
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/links/new"
              className="white-btn"
            >
              <FiLinkIcon className="w-4 h-4 mr-2" />
              New Link
            </Link>
          </div>
        </div>
      </div>

      {links.length === 0 ? (
        // Empty State with Action Buttons
        <div className="glass-card p-12 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center mb-6">
            <FiCode className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Links Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Create your first shortened link to generate QR codes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/links/new"
              className="white-btn px-8 py-3 text-lg"
            >
              <FiLinkIcon className="w-5 h-5 mr-2" />
              Create Your First Link
            </Link>
<Link
              href="/dashboard/links"
              className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600 px-8 py-3 text-lg"
            >
              <FiEye className="w-5 h-5 mr-2" />
              View Links
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Links List Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-4 sticky top-24">
              {/* Search Bar */}
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-white pl-10"
                />
              </div>

              {/* Links List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredLinks.map((link) => (
<button
                    key={link.id}
                    onClick={() => setSelectedLink(link)}
                    aria-pressed={selectedLink?.id === link.id}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedLink?.id === link.id
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium flex items-center">
                        <FiLinkIcon className="w-4 h-4 mr-2" />
                        {link.short_code}
                      </span>
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {link.clicks_count} clicks
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      selectedLink?.id === link.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {link.original_url}
                    </p>
                  </button>
                ))}

                {filteredLinks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No links found matching &quot;{searchTerm}&quot;
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Total Links:</span>
                  <span className="font-semibold">{links.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>Showing:</span>
                  <span className="font-semibold">{filteredLinks.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Display Area */}
          <div className="lg:col-span-2">
            {selectedLink ? (
              <div className="glass-card p-6">
                {/* Link Info */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    QR Code for {selectedLink.short_code}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <FiLinkIcon className="w-4 h-4" />
                    <span className="truncate">{selectedLink.original_url}</span>
                  </div>
                  
                  {/* Short URL Display with Copy Button */}
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                    <input
                      type="text"
                      value={getFullUrl(selectedLink.short_code)}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                    />
<button
                      onClick={() => copyToClipboard(getFullUrl(selectedLink.short_code))}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Copy URL"
                      aria-label={`Copy URL for ${selectedLink.short_code}`}
                    >
                      {copied ? (
                        <FiCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiCopy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
<a
                      href={`/${selectedLink.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                      title="Open link"
                      aria-label={`Open ${selectedLink.short_code} in new tab`}
                    >
                      <FiExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center mb-6">
<div 
                    ref={qrBoxRef}
                    className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg mb-4 cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <QRCode
                      id="qr-code"
                      value={getFullUrl(selectedLink.short_code)}
                      size={displayQrSize}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                  
                  {/* Size Control */}
                  <div className="w-full max-w-xs mb-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      QR Code Size: {qrSize}px
                    </label>
                    <input
                      type="range"
                      min="128"
                      max="512"
                      step="32"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={downloadQR}
                      disabled={downloading}
                      className="white-btn min-w-[140px]"
                    >
                      {downloading ? (
                        <>
                          <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FiDownloadCloud className="w-4 h-4 mr-2" />
                          Download PNG
                        </>
                      )}
                    </button>
                    
<button
                      onClick={() => setShowPreview(!showPreview)}
                      className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600"
                    >
                      <FiEye className="w-4 h-4 mr-2" />
                      {showPreview ? 'Hide' : 'Preview'} Large
                    </button>

<Link
                      href={`/dashboard/links/new?edit=${selectedLink.id}`}
                      className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600"
                    >
                      <FiLinkIcon className="w-4 h-4 mr-2" />
                      Edit Link
                    </Link>
                  </div>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-2xl w-full">
<div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">QR Code Preview</h3>
                        <button
                          onClick={closePreview}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          aria-label="Close preview"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
<div ref={previewBoxRef} className="flex justify-center p-4 sm:p-8 bg-gray-50 rounded-xl">
                        <QRCode
                          value={getFullUrl(selectedLink.short_code)}
                          size={previewQrSize}
                          level="H"
                        />
                      </div>
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={downloadQR}
                          className="white-btn"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download
                        </button>
<button
                          onClick={() => setShowPreview(false)}
                          className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 dark:!text-white dark:!border-gray-600"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">{selectedLink.clicks_count}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</div>
                  </div>
                  <div className="text-center">
<div className="text-sm sm:text-2xl font-bold text-gray-800 dark:text-white">
                      {new Date(selectedLink.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => window.open(`/${selectedLink.short_code}`, '_blank')}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      Test Link
                      <FiExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiGrid className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Link Selected</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a link from the list to generate its QR code
                </p>
              </div>
            )}
          </div>
        </div>
      )}

{/* Floating Action Button for Mobile */}
      {links.length > 0 && (
        <Link
          href="/dashboard/links/new"
          className="fixed bottom-6 right-6 lg:hidden white-btn p-4 rounded-full shadow-lg"
          aria-label="Create new link"
        >
          <FiLinkIcon className="w-6 h-6" />
        </Link>
      )}
    </div>
  )
}

export default function QRCodesPage() {
  return (
    <Suspense fallback={null}>
      <QRCodesContent />
    </Suspense>
  )
}

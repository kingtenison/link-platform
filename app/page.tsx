"use client"

import Link from 'next/link'
import {
  FiBarChart2,
  FiCode,
  FiShield,
  FiZap,
  FiGlobe,
  FiTrendingUp,
  FiChevronDown,
  FiLink,
  FiCheck,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import MergedHeader from '@/components/layout/MergedHeader'

const FAQ = [
  {
    q: 'Is LinkPlatform really free?',
    a: 'Yes. LinkPlatform is 100% free with no hidden fees, no credit card required, and no usage limits on link creation.',
  },
  {
    q: 'How fast are the redirects?',
    a: 'Redirects typically complete in under 50ms. Links are served from a globally distributed edge network for minimal latency regardless of visitor location.',
  },
  {
    q: 'What analytics are tracked for each click?',
    a: 'Every click is recorded with device type, browser, operating system, geographic location (country and city), referrer URL, and timestamp. All data is available in real-time on your dashboard.',
  },
  {
    q: 'Can I password-protect my links?',
    a: 'Yes. You can set a password on any link. Visitors must enter the correct password before being redirected to the destination URL.',
  },
  {
    q: 'Do links expire?',
    a: 'You can optionally set an expiration date, a maximum click limit, or schedule a link to activate at a future date. Expired links return a 410 Gone status.',
  },
  {
    q: 'Can I use a custom alias for my short link?',
    a: 'Yes. When creating a link you can specify a custom alias (letters and numbers only). If the alias is already taken you will be prompted to choose another.',
  },
  {
    q: 'How do QR codes work?',
    a: 'Every shortened link automatically gets a QR code. You can customize the size and download it as a PNG file. QR codes point to your short URL and work with any QR scanner.',
  },
  {
    q: 'Is there an API?',
    a: 'Yes. LinkPlatform provides a REST API for creating and managing short links programmatically. See the llms.txt file or API documentation for details.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-medium text-white pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown className="w-5 h-5 text-white/60 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/60 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const { user, loading } = useAuth()
  const [shortUrl, setShortUrl] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isShortening, setIsShortening] = useState(false)
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let rafId: number
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const isValidUrl = (value: string) => {
    if (!value.trim()) return false
    try {
      const parsed = new URL(value.trim())
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      try {
        const prefixed = new URL('https://' + value.trim())
        return prefixed.hostname.includes('.')
      } catch {
        return false
      }
    }
  }

  const scrollToShortener = () => {
    document.getElementById('shortener')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleShorten = async () => {
    const trimmed = shortUrl.trim()
    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid http(s) URL.')
      return
    }
    setError('')
    setIsShortening(true)
    try {
      const res = await fetch('/api/links/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed })
      })
      const data = await res.json()
      if (!res.ok || !data.shortUrl) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setShortenedUrl(data.shortUrl)
      setIsAnonymous(data.anonymous === true)
      setCopied(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsShortening(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy. Select the link to copy it manually.')
    }
  }

  const features = [
    {
      icon: FiZap,
      title: 'Instant Redirects',
      desc: 'Redirects complete in under 50ms from a global edge network.',
      color: 'from-amber-400 to-orange-500',
      delay: 0.1,
    },
    {
      icon: FiBarChart2,
      title: 'Click Analytics',
      desc: 'Track device, browser, location, and referrer for every click in real-time.',
      color: 'from-teal-400 to-emerald-500',
      delay: 0.2,
    },
    {
      icon: FiCode,
      title: 'QR Codes',
      desc: 'Auto-generated, downloadable QR codes for every shortened link.',
      color: 'from-cyan-400 to-teal-500',
      delay: 0.3,
    },
    {
      icon: FiShield,
      title: 'Link Protection',
      desc: 'Password-protect links, set expiration dates, and limit total clicks.',
      color: 'from-teal-500 to-cyan-600',
      delay: 0.4,
    },
    {
      icon: FiGlobe,
      title: 'Custom Aliases',
      desc: 'Create memorable branded short URLs with your own custom aliases.',
      color: 'from-cyan-400 to-sky-500',
      delay: 0.5,
    },
    {
      icon: FiTrendingUp,
      title: 'Scheduled Links',
      desc: 'Schedule links to activate at a future date and time automatically.',
      color: 'from-orange-400 to-red-500',
      delay: 0.6,
    },
  ]

  const steps = [
    {
      n: '01',
      icon: FiLink,
      title: 'Paste your long link',
      desc: 'Drop in any URL — a blog post, product page, wherever you want to send people. No signup needed.',
    },
    {
      n: '02',
      icon: FiZap,
      title: 'Get your short link instantly',
      desc: 'Your link is shortened right here, ready to copy and share. The result works immediately.',
    },
    {
      n: '03',
      icon: FiBarChart2,
      title: 'Create a free account to track every click',
      desc: 'Keep your links, watch analytics in real-time, protect them, and generate QR codes — free forever.',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-teal-950 to-gray-900 relative overflow-hidden">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'LinkPlatform',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Web',
            url: 'https://linkplatform.io',
            description:
              'Free URL shortener with real-time click analytics, QR code generation, password protection, link expiration, and custom aliases.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'URL Shortening',
              'Click Analytics',
              'QR Code Generation',
              'Password Protection',
              'Link Expiration',
              'Custom Aliases',
              'Scheduled Links',
            ],
            screenshot: 'https://linkplatform.io/og-image.png',
          }),
        }}
      />

      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: a,
              },
            })),
          }),
        }}
      />

      {/* Header */}
      <div className="relative z-20">
        <MergedHeader />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transition: 'all 0.1s ease-out',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: `${mousePosition.x * 0.05}px`,
            bottom: `${mousePosition.y * 0.05}px`,
            transition: 'all 0.15s ease-out',
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Hero Section */}
      <section id="shortener" className="relative z-10 w-full pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-16 md:pb-20 lg:pb-24 xl:pb-28 scroll-mt-8">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
                100% free — No signup required to shorten
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Shorten Links.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-200 to-amber-300">
                Track Everything.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
            >
              Paste a long link below and get a short one in seconds — no signup
              needed. Create a free account to track every click, protect links,
              and generate QR codes.
            </motion.p>

            {/* URL Shortener Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-3xl mx-auto"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleShorten()
                }}
                aria-label="Shorten a URL"
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="url"
                  placeholder="https://your-long-url.com/..."
                  value={shortUrl}
                  onChange={(e) => {
                    setShortUrl(e.target.value)
                    if (error) setError('')
                    if (shortenedUrl) setShortenedUrl('')
                  }}
                  aria-label="URL to shorten"
                  className="flex-1 bg-white/90 border-0 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-0"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isShortening}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-amber-500/30 transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {isShortening ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-b-transparent" />
                  ) : (
                    <>
                      Shorten URL
                      <FiZap className="ml-2 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Trust row */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <FiCheck className="w-4 h-4 text-emerald-400" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheck className="w-4 h-4 text-emerald-400" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCheck className="w-4 h-4 text-emerald-400" /> Real-time click tracking
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-4 bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm flex flex-wrap items-center justify-center gap-2"
                >
                  <span>{error}</span>
                </motion.div>
              )}

              {shortenedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden text-left"
                >
                  <div className="p-5 flex items-center justify-between gap-3 border-b border-white/10">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                        Your short link
                      </p>
                      <a
                        href={shortenedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-mono text-lg sm:text-xl truncate block hover:text-teal-300 transition-colors"
                      >
                        {shortenedUrl}
                      </a>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`ml-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 flex items-center gap-2 ${
                        copied
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-900 hover:bg-white/90'
                      }`}
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-4 h-4" /> Copied!
                        </>
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>

                  {isAnonymous ? (
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-amber-500/10">
                      <p className="text-sm text-white/80 flex-1">
                        <span className="font-semibold text-white">
                          Want to keep this link and see every click?
                        </span>{' '}
                        Create a free account to manage your links, watch
                        analytics in real-time, protect them with passwords, and
                        get QR codes.
                      </p>
                      <Link
                        href="/register"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-amber-500/30 transition-all text-center"
                      >
                        Create Free Account
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center justify-between gap-3">
                      <p className="text-sm text-white/70">
                        Saved to your account.
                      </p>
                      <Link
                        href="/dashboard"
                        className="text-sm text-teal-300 hover:text-white font-medium transition-colors"
                      >
                        Open dashboard →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28 scroll-mt-24">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get started in three steps
            </h2>
            <p className="text-xl text-white/60">
              From long link to tracked link — in under a minute
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left group"
              >
                <span className="absolute top-5 right-6 text-5xl font-bold text-white/5 group-hover:text-white/10 transition-colors select-none">
                  {step.n}
                </span>
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28 scroll-mt-24">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need in one platform
            </h2>
            <p className="text-xl text-white/60">
              Powerful features that help you share smarter and track better
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-teal-500/10 transition-all group"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28 scroll-mt-24">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/60">
              Quick answers about LinkPlatform
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8"
          >
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28">
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-teal-700 via-cyan-800 to-teal-900 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Ready to get started?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/80 mb-8"
              >
                Create your free account and start shortening links in seconds.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {user ? (
                  <Link
                    href="/dashboard"
                    className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center group"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center group"
                    >
                      Create Free Account
                    </Link>
                    <button
                      onClick={scrollToShortener}
                      className="bg-white/15 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/25 transition-all flex items-center justify-center group"
                    >
                      Shorten a link now
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
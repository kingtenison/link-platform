"use client"

import Link from 'next/link'
import {
  FiBarChart2,
  FiCode,
  FiShield,
  FiStar,
  FiZap,
  FiGlobe,
  FiTrendingUp,
  FiChevronDown,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

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
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
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
  const [isShortening, setIsShortening] = useState(false)
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

  const handleShorten = async () => {
    if (!shortUrl.trim()) return
    setIsShortening(true)
    try {
      const res = await fetch('/api/links/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shortUrl })
      })
      const data = await res.json()
      if (data.shortUrl) {
        setShortenedUrl(data.shortUrl)
      }
    } catch {
      // silently fail
    } finally {
      setIsShortening(false)
    }
  }

  const features = [
    {
      icon: FiZap,
      title: 'Instant Redirects',
      desc: 'Redirects complete in under 50ms from a global edge network.',
      color: 'from-yellow-400 to-orange-500',
      delay: 0.1,
    },
    {
      icon: FiBarChart2,
      title: 'Click Analytics',
      desc: 'Track device, browser, location, and referrer for every click in real-time.',
      color: 'from-green-400 to-emerald-500',
      delay: 0.2,
    },
    {
      icon: FiCode,
      title: 'QR Codes',
      desc: 'Auto-generated, downloadable QR codes for every shortened link.',
      color: 'from-purple-400 to-pink-500',
      delay: 0.3,
    },
    {
      icon: FiShield,
      title: 'Link Protection',
      desc: 'Password-protect links, set expiration dates, and limit total clicks.',
      color: 'from-blue-400 to-indigo-500',
      delay: 0.4,
    },
    {
      icon: FiGlobe,
      title: 'Custom Aliases',
      desc: 'Create memorable branded short URLs with your own custom aliases.',
      color: 'from-cyan-400 to-blue-500',
      delay: 0.5,
    },
    {
      icon: FiTrendingUp,
      title: 'Scheduled Links',
      desc: 'Schedule links to activate at a future date and time automatically.',
      color: 'from-red-400 to-pink-500',
      delay: 0.6,
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
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

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.1}px`,
            top: `${mousePosition.y * 0.1}px`,
            transition: 'all 0.1s ease-out',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
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
      <section className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28">
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
                100% free - No credit card required
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                Track Everything.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
            >
              A free URL shortener with real-time click analytics, QR codes,
              password protection, and custom aliases. Privacy-friendly.
            </motion.p>

            {/* URL Shortener Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://your-long-url.com/..."
                  value={shortUrl}
                  onChange={(e) => setShortUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                  className="flex-1 bg-white/90 border-0 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShorten}
                  disabled={isShortening}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {isShortening ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent" />
                  ) : (
                    <>
                      Shorten URL
                      <FiZap className="ml-2 group-hover:rotate-12 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
              {shortenedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 flex items-center justify-between"
                >
                  <span className="text-white font-mono text-sm truncate">{shortenedUrl}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(shortenedUrl) }}
                    className="ml-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors flex-shrink-0"
                  >
                    Copy
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28">
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
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group"
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
      <section className="relative z-10 w-full py-16 md:py-20 lg:py-24 xl:py-28">
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
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden"
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
                    <FiStar className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center justify-center group"
                  >
                    <FiStar className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Create Free Account
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

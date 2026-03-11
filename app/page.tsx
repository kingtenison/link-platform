"use client"

import Link from 'next/link'
import { 
  FiLink, 
  FiBarChart2, 
  FiCode, 
  FiShield, 
  FiArrowRight, 
  FiStar,
  FiZap,
  FiGlobe,
  FiTrendingUp,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAward
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user, loading } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [counts, setCounts] = useState({ links: 0, clicks: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        links: prev.links < 1500000 ? prev.links + 50000 : 1500000,
        clicks: prev.clicks < 12500000 ? prev.clicks + 500000 : 12500000
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    { 
      icon: FiZap, 
      title: 'Lightning Fast', 
      desc: 'Create and redirect links in milliseconds',
      color: 'from-yellow-400 to-orange-500',
      delay: 0.1
    },
    { 
      icon: FiBarChart2, 
      title: 'Advanced Analytics', 
      desc: 'Track every click with detailed insights',
      color: 'from-green-400 to-emerald-500',
      delay: 0.2
    },
    { 
      icon: FiCode, 
      title: 'Smart QR Codes', 
      desc: 'Auto-generated QR codes for every link',
      color: 'from-purple-400 to-pink-500',
      delay: 0.3
    },
    { 
      icon: FiShield, 
      title: 'Bank-Level Security', 
      desc: 'Enterprise-grade protection for your links',
      color: 'from-blue-400 to-indigo-500',
      delay: 0.4
    },
    { 
      icon: FiGlobe, 
      title: 'Global CDN', 
      desc: 'Lightning-fast redirects worldwide',
      color: 'from-cyan-400 to-blue-500',
      delay: 0.5
    },
    { 
      icon: FiTrendingUp, 
      title: 'Growth Tools', 
      desc: 'A/B testing and campaign tracking',
      color: 'from-red-400 to-pink-500',
      delay: 0.6
    }
  ]

  const stats = [
    { icon: FiLink, value: '1.5M+', label: 'Links Created', color: 'from-blue-500 to-purple-600' },
    { icon: FiUsers, value: '12.5M+', label: 'Clicks Tracked', color: 'from-green-500 to-teal-600' },
    { icon: FiAward, value: '99.99%', label: 'Uptime SLA', color: 'from-orange-500 to-red-600' },
    { icon: FiClock, value: '24/7', label: 'Support', color: 'from-purple-500 to-pink-600' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            left: `${mousePosition.x * 0.1}px`, 
            top: `${mousePosition.y * 0.1}px`,
            transition: 'all 0.1s ease-out'
          }} 
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{ 
            right: `${mousePosition.x * 0.05}px`, 
            bottom: `${mousePosition.y * 0.05}px`,
            transition: 'all 0.15s ease-out'
          }} 
        />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
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
                ✨ Join 50,000+ happy users
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold mb-6"
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
              The most beautiful URL shortener with real-time analytics, QR codes, 
              and enterprise-grade security.
            </motion.p>

            {/* URL Shortener Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://your-long-url.com/..."
                  className="flex-1 bg-white/90 border-0 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center group"
                >
                  Shorten URL
                  <FiZap className="ml-2 group-hover:rotate-12 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
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
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Powerful features that help you grow and track your audience
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
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-white/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden"
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
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of satisfied users and start shortening your links today.
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
      </section>
    </main>
  )
}

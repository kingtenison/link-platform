"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiZap, FiTrendingUp, FiClock, FiAward, FiBarChart2 } from 'react-icons/fi'
import { useEffect, useState } from 'react'

interface MergedHeaderProps {
  stats?: {
    totalLinks: number
    totalClicks: number
  }
  userName?: string
}

export default function MergedHeader({ stats, userName }: MergedHeaderProps) {
  const { user, loading, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full fixed top-0 left-0 z-50"
    >
      <div className="relative">
        {/* Glass background with gradient - full width, no padding */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-600/90 dark:via-purple-600/90 dark:to-pink-600/90 shadow-lg" />
        
        {/* Content - full width with the same generous scaling as the dashboard */}
        <div className="relative px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-3 sm:py-4">
          <div className="w-full">
            {/* Top Row - Logo and Navigation */}
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/20"
                >
                  <span className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">L</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-white">LinkPlatform</span>
                  <span className="text-[10px] sm:text-xs text-white/80 hidden xs:block">Smart URL Shortener</span>
                </div>
              </Link>

              {/* Navigation */}
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                {/* Analytics Button - Always visible when logged in */}
                {!loading && user && (
                  <Link 
                    href="/dashboard/analytics" 
                    className="relative group"
                  >
                    <div className="relative px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white group-hover:bg-white/30 transition-all flex items-center space-x-1.5 sm:space-x-2">
                      <FiBarChart2 className="w-4 h-4" />
                      <span className="text-sm hidden xs:inline font-medium">Analytics</span>
                    </div>
                  </Link>
                )}
                
                <ThemeToggle />
                
                {!loading && user ? (
                  <div className="flex items-center space-x-1.5 sm:space-x-3">
                    <Link 
                      href="/dashboard" 
                      className="relative group"
                    >
                      <div className="relative px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white group-hover:bg-white/30 transition-all flex items-center space-x-1.5 sm:space-x-2">
                        <FiUser className="w-4 h-4" />
                        <span className="text-sm hidden xs:inline font-medium">Dashboard</span>
                      </div>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="relative group"
                    >
                      <div className="relative px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white group-hover:bg-white/30 transition-all flex items-center space-x-1.5 sm:space-x-2">
                        <FiLogOut className="w-4 h-4" />
                        <span className="text-sm hidden xs:inline font-medium">Sign Out</span>
                      </div>
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 sm:space-x-3">
                      <Link 
                        href="/login" 
                        className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-white/90 hover:text-white rounded-xl transition-colors font-medium text-sm"
                      >
                        Login
                      </Link>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link 
                          href="/register" 
                          className="relative group"
                        >
                          <div className="relative px-4 sm:px-6 py-1.5 sm:py-2.5 bg-white text-blue-600 rounded-xl font-semibold shadow-lg shadow-white/20 group-hover:shadow-xl transition-all flex items-center space-x-2">
                            <FiZap className="w-4 h-4" />
                            <span className="text-sm hidden xs:inline">Get Started</span>
                            <span className="text-sm xs:hidden">Free</span>
                          </div>
                        </Link>
                      </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Message */}
            {user && stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-white/20 mt-3 sm:mt-4 pt-3 sm:pt-4"
              >
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5">
                      Welcome back, {userName || user.name || 'User'}! 👋
                    </h2>
                    <p className="text-sm text-white/90">
                      <span className="font-bold">{stats.totalLinks}</span> links ·{' '}
                      <span className="font-bold">{stats.totalClicks}</span> clicks
                    </p>
                  </div>
 
                  {/* Quick stats chips */}
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm text-white flex items-center">
                      <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="hidden xs:inline">Growth:</span> +15%
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm text-white flex items-center">
                      <FiClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="hidden xs:inline">Peak:</span> 6-9PM
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm text-white flex items-center">
                      <FiAward className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="hidden xs:inline">Top:</span> Direct
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

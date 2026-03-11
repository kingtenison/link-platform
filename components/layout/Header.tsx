"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { motion } from 'framer-motion'
import { FiLogOut, FiUser, FiZap } from 'react-icons/fi'

export default function Header() {
  const { user, loading, logout } = useAuth()

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl mx-auto z-50"
    >
      <div className="relative">
        {/* Glass background */}
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800/50" />
        
        {/* Content */}
        <div className="relative px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo with animated gradient */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <span className="text-white font-bold text-xl">L</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinkPlatform
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Smart URL Shortener</span>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {!loading && user ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/dashboard" 
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                    <div className="relative px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 group-hover:border-transparent transition-all flex items-center space-x-2 shadow-sm hover:shadow-md">
                      <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Dashboard</span>
                    </div>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                    <div className="relative px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-red-600 dark:text-red-400 group-hover:border-transparent transition-all flex items-center space-x-2 shadow-sm hover:shadow-md">
                      <FiLogOut className="w-4 h-4" />
                      <span className="font-medium">Sign Out</span>
                    </div>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/login" 
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors font-medium"
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
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                      <div className="relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 group-hover:shadow-xl transition-all flex items-center space-x-2">
                        <FiZap className="w-4 h-4" />
                        <span>Get Started Free</span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

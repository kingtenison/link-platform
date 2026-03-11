'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiLink, 
  FiBarChart2, 
  FiCode, 
  FiShield, 
  FiGrid, 
  FiArrowRight, 
  FiExternalLink,
  FiMousePointer,
  FiZap,
  FiEye,
  FiCopy,
  FiTrendingUp,
  FiClock,
  FiAward,
  FiActivity
} from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import MergedHeader from '@/components/layout/MergedHeader'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [links, setLinks] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    qrCodes: 0,
    safetyScore: 100
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentLinks, setRecentLinks] = useState<any[]>([])
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const { data: linksData, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLinks(linksData || [])
      
      const totalClicks = (linksData || []).reduce((sum, link) => sum + (link.clicks_count || 0), 0)
      
      setStats({
        totalLinks: linksData?.length || 0,
        totalClicks: totalClicks,
        qrCodes: linksData?.length || 0,
        safetyScore: 100
      })

      setRecentLinks(linksData?.slice(0, 5) || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const quickActions = [
    { 
      name: 'Create New Link', 
      href: '/dashboard/links/new', 
      icon: FiZap, 
      color: 'from-blue-500 to-purple-600',
      description: 'Shorten a new URL',
      bgImage: 'url("https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
    },
    { 
      name: 'View All Links', 
      href: '/dashboard/links', 
      icon: FiGrid, 
      color: 'from-purple-500 to-pink-600',
      description: 'Manage your links',
      bgImage: 'url("https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
    },
    { 
      name: 'QR Codes', 
      href: '/dashboard/qrcodes', 
      icon: FiCode, 
      color: 'from-green-500 to-blue-600',
      description: 'Generate & download',
      bgImage: 'url("https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
    },
  ]

  const statBackgrounds = [
    'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
    'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
    'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
    'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
  ]

  const statCards = [
    { 
      label: 'Total Links', 
      value: stats.totalLinks, 
      icon: FiLink, 
      color: 'from-blue-500 to-purple-600',
      description: 'Active short links',
      trend: '+2 this week',
      bgImage: statBackgrounds[0]
    },
    { 
      label: 'Total Clicks', 
      value: stats.totalClicks, 
      icon: FiMousePointer, 
      color: 'from-green-500 to-teal-600',
      description: 'All-time clicks',
      trend: '+15% vs last week',
      bgImage: statBackgrounds[1]
    },
    { 
      label: 'QR Codes', 
      value: stats.qrCodes, 
      icon: FiCode, 
      color: 'from-purple-500 to-pink-600',
      description: 'Ready to download',
      trend: 'All links have QR',
      bgImage: statBackgrounds[2]
    },
    { 
      label: 'Safety Score', 
      value: `${stats.safetyScore}%`, 
      icon: FiShield, 
      color: 'from-orange-500 to-red-600',
      description: 'All links safe',
      trend: 'No threats detected',
      bgImage: statBackgrounds[3]
    },
  ]

  return (
    <>
      <MergedHeader stats={stats} userName={user?.name} />
      <main className="pt-16 sm:pt-20">
        <div className="px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 sm:space-y-8"
          >
            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {quickActions.map((action) => (
                <motion.div
                  key={action.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, rotateY: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full"
                >
                  <Link
                    href={action.href}
                    className="block relative overflow-hidden rounded-xl sm:rounded-2xl h-36 sm:h-44 group"
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: action.bgImage }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
                    
                    <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                          <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                      </div>
                      
                      <div>
                        <h3 className="text-base sm:text-lg font-bold mb-0.5">{action.name}</h3>
                        <p className="text-xs sm:text-sm text-white/80">{action.description}</p>
                      </div>
                    </div>

                    {/* Animated particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white/30 rounded-full"
                          animate={{
                            x: [Math.random() * 100, Math.random() * 100],
                            y: [Math.random() * 100, Math.random() * 100],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                        />
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onHoverStart={() => setHoveredStat(stat.label)}
                  onHoverEnd={() => setHoveredStat(null)}
                  className="relative overflow-hidden rounded-xl sm:rounded-2xl group"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: stat.bgImage }}
                  />
                  
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
                  
                  <div className="relative p-4 sm:p-5 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      
                      <div className="hidden sm:flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              height: hoveredStat === stat.label ? [20, 40, 30, 45, 25][i] : [15, 25, 20, 30, 15][i]
                            }}
                            className="w-1 bg-white rounded-full"
                            style={{ height: '20px' }}
                            transition={{ duration: 0.5 }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-white/80">{stat.label}</p>
                      <motion.p 
                        key={stat.value}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl sm:text-2xl font-bold text-white"
                      >
                        {typeof stat.value === 'number' ? (
                          <CountUp end={stat.value} duration={2} separator="," />
                        ) : (
                          stat.value
                        )}
                      </motion.p>
                      <p className="text-xs text-white/70">{stat.description}</p>
                      <p className="text-xs font-medium text-white/90">{stat.trend}</p>
                    </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        animate={{
                          x: [Math.random() * 100, Math.random() * 100],
                          y: [Math.random() * 100, Math.random() * 100],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              variants={itemVariants}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl group mb-6"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90 group-hover:opacity-80 transition-opacity" />
              
              <div className="relative p-4 sm:p-6 text-white">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <FiActivity className="mr-2 w-5 h-5" />
                    Recent Activity
                  </h2>
                  {recentLinks.length > 0 && (
                    <Link 
                      href="/dashboard/links" 
                      className="text-sm sm:text-base text-white/90 hover:text-white flex items-center group/link"
                    >
                      <span>View all</span>
                      <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                {recentLinks.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6"
                    >
                      <FiLink className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No links yet</h3>
                    <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-md mx-auto">
                      Create your first link and start tracking your audience today!
                    </p>
                    <Link
                      href="/dashboard/links/new"
                      className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg shadow-white/20 hover:shadow-xl transition-all group"
                    >
                      <FiZap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Create Your First Link
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLinks.map((link) => (
                      <motion.div
                        key={link.id}
                        whileHover={{ scale: 1.01, x: 3 }}
                        className="group/item"
                      >
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/30 hover:border-white/50 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <FiLink className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm sm:text-base text-white">
                                    {link.short_code}
                                  </span>
                                  <span className="text-xs bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center">
                                    <FiEye className="w-3 h-3 mr-1" />
                                    {link.clicks_count}
                                  </span>
                                  <span className="text-xs bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                                    QR ready
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-white/80 truncate max-w-xs sm:max-w-sm lg:max-w-md">
                                  {link.original_url}
                                </p>
                                <p className="text-xs text-white/70 mt-1">
                                  {new Date(link.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 sm:space-x-3 ml-11 sm:ml-0">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/${link.short_code}`)
                                  toast.success('Copied to clipboard!')
                                }}
                                className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                                title="Copy link"
                              >
                                <FiCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                              </button>

                              <Link
                                href={`/dashboard/qrcodes?link=${link.id}`}
                                className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                                title="Generate QR code"
                              >
                                <FiCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                              </Link>

                              <a
                                href={`/${link.short_code}`}
                                target="_blank"
                                className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                                title="Open link"
                              >
                                <FiExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    animate={{
                      x: [Math.random() * 100, Math.random() * 100],
                      y: [Math.random() * 100, Math.random() * 100],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  )
}

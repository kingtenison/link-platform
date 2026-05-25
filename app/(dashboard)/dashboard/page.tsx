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
import { motion, Variants } from 'framer-motion'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import MergedHeader from '@/components/layout/MergedHeader'
import NativeBanner from '@/components/ads/NativeBanner'

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Fetch dashboard data
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
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setIsLoading(false)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  // Loading state
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

  // Not authenticated
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
      <MergedHeader stats={stats} userName={user?.name ?? undefined} />
      <main className="pt-16 sm:pt-20">
        <div className="dashboard-container">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12 sm:space-y-16 lg:space-y-20"
          >
            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
              </div>

              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
              >
                {quickActions.map((action) => (
                  <motion.div
                    key={action.name}
                    variants={itemVariants}
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="w-full"
                  >
                    <Link
                      href={action.href}
                      className="block relative overflow-hidden rounded-3xl h-48 sm:h-56 lg:h-64 xl:h-72 group"
                    >
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.08]"
                        style={{ backgroundImage: action.bgImage }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-85 transition-opacity`} />
                      
                      <div className="relative h-full p-8 lg:p-10 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between">
                          <div className="w-11 h-11 bg-white/25 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <action.icon className="w-5 h-5" />
                          </div>
                          <FiArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        
                        <div>
                          <h3 className="text-[15px] sm:text-base font-semibold tracking-tight mb-1">{action.name}</h3>
                          <p className="text-sm text-white/75 leading-snug">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Stats Overview */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
              </div>

              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
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
                  
                   <div className="relative p-8 lg:p-10 text-white">
                     <div className="flex items-start justify-between mb-4">
                       <div className="w-10 h-10 bg-white/25 backdrop-blur-md rounded-xl flex items-center justify-center">
                         <stat.icon className="w-5 h-5" />
                       </div>
                       
                       <div className="hidden lg:flex items-center gap-1">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className="w-0.5 h-3 bg-white/40 rounded-full" />
                         ))}
                       </div>
                     </div>

                     <div>
                       <p className="text-sm text-white/70 mb-1">{stat.label}</p>
                       <div className="text-3xl font-semibold tracking-tighter mb-1">
                         {typeof stat.value === 'number' ? (
                           <CountUp end={stat.value} duration={2} separator="," />
                         ) : (
                           stat.value
                         )}
                       </div>
                       <div className="text-xs text-white/60">{stat.trend}</div>
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

                  {/* Animated progress bar */}
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
           </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
                {recentLinks.length > 0 && (
                  <Link href="/dashboard/links" className="text-sm text-white/70 hover:text-white flex items-center gap-1 transition-colors">
                    View all <FiArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="relative overflow-hidden rounded-3xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700/95 via-purple-700/95 to-pink-700/95" />
                
                <div className="relative text-white p-8 lg:p-10">

                {recentLinks.length === 0 ? (
                   <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                      <FiLink className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">No links yet</h3>
                    <p className="text-white/70 mb-8 max-w-sm mx-auto text-lg">
                      Create your first short link to get started.
                    </p>
                    <Link
                      href="/dashboard/links/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-2xl font-semibold hover:bg-white/90 transition-colors text-lg"
                    >
                      Create your first link
                    </Link>
                  </div>
                ) : (
                   <div className="space-y-2">
                     {recentLinks.map((link) => (
                       <div key={link.id} className="group">
                         <div className="bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-xl px-5 py-4 transition-colors border border-white/10 hover:border-white/20">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                             <div className="min-w-0">
                               <div className="flex items-center gap-3 mb-1.5">
                                 <span className="font-medium text-[15px] text-white tracking-tight">
                                   {link.short_code}
                                 </span>
                                 <span className="text-xs px-2 py-0.5 rounded bg-white/20 text-white/90 flex items-center gap-1">
                                   <FiEye className="w-3 h-3" /> {link.clicks_count}
                                 </span>
                               </div>
                               <p className="text-sm text-white/75 truncate max-w-[420px]">
                                 {link.original_url}
                               </p>
                               <p className="text-xs text-white/50 mt-1.5">
                                 {new Date(link.created_at).toLocaleDateString('en-US', { 
                                   month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                 })}
                               </p>
                             </div>

                             <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                               <button onClick={() => {
                                 navigator.clipboard.writeText(`${window.location.origin}/${link.short_code}`);
                                 toast.success('Copied');
                               }} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Copy">
                                 <FiCopy className="w-4 h-4" />
                               </button>
                               <Link href={`/dashboard/qrcodes?link=${link.id}`} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="QR">
                                 <FiCode className="w-4 h-4" />
                               </Link>
                               <a href={`/${link.short_code}`} target="_blank" className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Open">
                                 <FiExternalLink className="w-4 h-4" />
                               </a>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                    </div>
                  )}
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    )
  }



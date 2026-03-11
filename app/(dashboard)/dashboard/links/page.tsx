'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiLink, 
  FiCopy, 
  FiExternalLink, 
  FiSearch,
  FiPlus,
  FiCode,
  FiBarChart2,
  FiTrash2,
  FiClock,
  FiEye,
  FiZap,
  FiFilter
} from 'react-icons/fi'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'

export default function LinksPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [links, setLinks] = useState<any[]>([])
  const [filteredLinks, setFilteredLinks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchLinks()
    }
  }, [user])

  useEffect(() => {
    let filtered = [...links]
    
    if (searchTerm) {
      filtered = filtered.filter(link => 
        link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        return (b.clicks_count || 0) - (a.clicks_count || 0)
      }
    })
    
    setFilteredLinks(filtered)
  }, [searchTerm, links, sortBy])

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
      setFilteredLinks(data || [])
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Failed to load links')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(url)
    toast.success('Copied to clipboard!')
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)

      if (error) throw error

      setLinks(links.filter(l => l.id !== id))
      toast.success('Link deleted successfully')
    } catch (error) {
      toast.error('Failed to delete link')
    }
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks_count || 0), 0)
  const averageClicks = links.length ? (totalClicks / links.length).toFixed(1) : 0
  const topLink = links.length ? Math.max(...links.map(l => l.clicks_count || 0)) : 0

  const pageVariants: Variants = {
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

if (loading || isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Links</h1>
              <p className="text-white/90 text-lg">
                Manage and track all your shortened links
              </p>
            </div>
            <Link
              href="/dashboard/links/new"
              className="white-btn inline-flex items-center px-6 py-3 text-lg group"
            >
              <FiZap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Create New Link
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Total Links</p>
              <p className="text-3xl font-bold">
                <CountUp end={links.length} duration={2} />
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Total Clicks</p>
              <p className="text-3xl font-bold">
                <CountUp end={totalClicks} duration={2} />
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Avg Clicks/Link</p>
              <p className="text-3xl font-bold">
                <CountUp end={Number(averageClicks)} duration={2} decimals={1} />
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Top Link</p>
              <p className="text-3xl font-bold">
                <CountUp end={topLink} duration={2} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by short code or original URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-white pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filter
            </motion.button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="white-btn-outline !bg-transparent !text-gray-800 !border-gray-300 px-4 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex gap-4">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2" /> Show active only
                </label>
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2" /> With QR codes
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Links Grid/Table */}
      {filteredLinks.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-16 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6"
          >
            <FiLink className="w-12 h-12 text-blue-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {searchTerm ? 'No matches found' : 'No links yet'}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchTerm 
              ? `No links match "${searchTerm}". Try a different search term.`
              : 'Create your first link and start tracking your audience today!'}
          </p>
          {!searchTerm && (
            <Link
              href="/dashboard/links/new"
              className="white-btn inline-flex text-lg px-8 py-3 group"
            >
              <FiZap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Create Your First Link
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link, index) => (
            <motion.div
              key={link.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 5 }}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              
              <div className="relative glass-card p-6 hover:shadow-xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"
                      >
                        <FiLink className="w-5 h-5 text-white" />
                      </motion.div>
                      
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-lg font-semibold text-gray-800">
                            {link.short_code}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center">
                            <FiEye className="w-3 h-3 mr-1" />
                            <CountUp end={link.clicks_count || 0} duration={1} /> clicks
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            QR ready
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500 truncate max-w-md">
                            {link.original_url}
                          </span>
                          <button
                            onClick={() => copyToClipboard(link.short_code)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => copyToClipboard(link.short_code)}
                        className="p-3 hover:bg-white rounded-xl transition-all group relative"
                      >
                        <FiCopy className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                      </button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={`/dashboard/qrcodes?link=${link.id}`}
                        className="p-3 hover:bg-white rounded-xl transition-all group relative"
                      >
                        <FiCode className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href={`/${link.short_code}`}
                        target="_blank"
                        className="p-3 hover:bg-white rounded-xl transition-all group relative"
                      >
                        <FiExternalLink className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
                      </a>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href={`/dashboard/analytics?link=${link.id}`}
                        className="p-3 hover:bg-white rounded-xl transition-all group relative"
                      >
                        <FiBarChart2 className="w-5 h-5 text-gray-500 group-hover:text-orange-600" />
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-3 hover:bg-white rounded-xl transition-all group relative"
                      >
                        <FiTrash2 className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* Progress bar for clicks */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min((link.clicks_count / 100) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}



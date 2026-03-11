'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiCalendar, 
  FiDownload,
  FiRefreshCw,
  FiMapPin,
  FiMonitor,
  FiMousePointer,
  FiLink,
  FiArrowLeft,
  FiEye
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { PageWrapper, AnimatedCard, itemVariants, buttonVariants } from '@/components/ui/animations'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import { format, subDays, subMonths, eachDayOfInterval } from 'date-fns'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [links, setLinks] = useState<any[]>([])
  const [clicks, setClicks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all') // Changed default to 'all'
  const [selectedLink, setSelectedLink] = useState<string>('all')
  const [chartData, setChartData] = useState<any[]>([])
  const [deviceData, setDeviceData] = useState<any[]>([])
  const [locationData, setLocationData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    avgClicksPerDay: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, dateRange, selectedLink])

  // Check for link ID in URL params
  useEffect(() => {
    const linkId = searchParams.get('link')
    if (linkId) {
      setSelectedLink(linkId)
    }
  }, [searchParams])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch user's links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (linksError) throw linksError
      setLinks(linksData || [])

      // Build query for clicks
      let query = supabase
        .from('click_analytics')
        .select(`
          *,
          links (
            short_code,
            original_url
          )
        `)
        .eq('user_id', user?.id)
        .order('clicked_at', { ascending: false })

      // Filter by link if selected
      if (selectedLink !== 'all') {
        query = query.eq('link_id', selectedLink)
      }

      // Filter by date range (if not 'all')
      if (dateRange !== 'all') {
        const now = new Date()
        let startDate
        switch (dateRange) {
          case '7d':
            startDate = subDays(now, 7)
            break
          case '30d':
            startDate = subDays(now, 30)
            break
          case '90d':
            startDate = subDays(now, 90)
            break
        }
        query = query.gte('clicked_at', startDate.toISOString())
      }

      console.log('>>> Fetching clicks for:', {
        link: selectedLink,
        dateRange,
        userId: user?.id
      })

      const { data: clicksData, error: clicksError } = await query

      if (clicksError) throw clicksError
      
      console.log('>>> Found clicks:', clicksData?.length || 0)
      setClicks(clicksData || [])
      
      // Process data for charts
      processData(clicksData || [])
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const processData = (clicks: any[]) => {
    // Process device data
    const devices = clicks.reduce((acc: any, click) => {
      const device = click.device_type || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})
    setDeviceData(Object.entries(devices).map(([name, value]) => ({ name, value })))

    // Process location data
    const locations = clicks.reduce((acc: any, click) => {
      const country = click.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})
    setLocationData(Object.entries(locations).map(([name, value]) => ({ name, value })))

    // Calculate stats
    setStats({
      totalClicks: clicks.length,
      uniqueVisitors: new Set(clicks.map(c => c.visitor_id)).size,
      avgClicksPerDay: clicks.length > 0 ? clicks.length / 30 : 0
    })

    // Process chart data (group by date)
    const clicksByDate = clicks.reduce((acc: any, click) => {
      const date = format(new Date(click.clicked_at), 'MMM dd')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const chart = Object.entries(clicksByDate).map(([date, clicks]) => ({
      date,
      clicks
    })).sort((a, b) => {
      // Sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    setChartData(chart)
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

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
    <PageWrapper>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-white/90 text-lg">
                Track your link performance with real-time data
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={fetchData}
                className="white-btn-outline !bg-transparent !text-white !border-white hover:!bg-white/20"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-6">
            <select
              value={selectedLink}
              onChange={(e) => setSelectedLink(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Links</option>
              {links.map(link => (
                <option key={link.id} value={link.id}>
                  {link.short_code} ({link.clicks_count || 0} clicks)
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 text-sm"
            >
              <option value="all">All Time</option>
              <option value="90d">Last 90 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FiMousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              <CountUp end={stats.totalClicks} duration={2} />
            </span>
          </div>
          <p className="text-gray-600 text-sm">Total Clicks</p>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiEye className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              <CountUp end={stats.uniqueVisitors} duration={2} />
            </span>
          </div>
          <p className="text-gray-600 text-sm">Unique Visitors</p>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              <CountUp end={stats.avgClicksPerDay} duration={2} decimals={1} />
            </span>
          </div>
          <p className="text-gray-600 text-sm">Avg Clicks/Day</p>
        </AnimatedCard>
      </div>

      {/* Chart */}
      <AnimatedCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Traffic Overview</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No click data available for this period
          </div>
        )}
      </AnimatedCard>

      {/* Device Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Device Distribution</h2>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No device data
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Top Countries</h2>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No location data
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* Recent Clicks */}
      <AnimatedCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Clicks</h2>
        {clicks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Link</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Device</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {clicks.slice(0, 10).map((click) => (
                  <tr key={click.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {click.links?.short_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4">{click.country || 'Unknown'}</td>
                    <td className="py-3 px-4">{click.device_type || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {format(new Date(click.clicked_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No clicks recorded yet
          </div>
        )}
      </AnimatedCard>
    </PageWrapper>
  )
}


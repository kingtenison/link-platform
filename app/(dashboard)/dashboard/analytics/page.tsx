'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ApiLink, ApiClick } from '@/lib/api'
import { 
  FiTrendingUp, 
  FiRefreshCw,
  FiMousePointer,
  FiEye
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import { PageWrapper, AnimatedCard, buttonVariants } from '@/components/ui/animations'
import {
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
import { format } from 'date-fns'
import PageTitle from '@/components/ui/PageTitle'

// Create a separate component for the analytics content that uses useSearchParams
function AnalyticsContent() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [links, setLinks] = useState<ApiLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all')
  const [selectedLink, setSelectedLink] = useState<string>(
    () => searchParams.get('link') ?? 'all'
  )
  const [chartData, setChartData] = useState<{ date: string; clicks: number }[]>([])
  const [deviceData, setDeviceData] = useState<{ name: string; value: number }[]>([])
  const [locationData, setLocationData] = useState<{ name: string; value: number }[]>([])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRange, selectedLink])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('linkId', selectedLink)
      params.set('range', dateRange)

      const res = await fetch(`/api/analytics?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load analytics')

      const data = await res.json()
      const linksData: ApiLink[] = data.links || []
      const clicksData: ApiClick[] = data.clicks || []

      setLinks(linksData)
      processData(clicksData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const processData = (clicks: ApiClick[]) => {
    const devices = clicks.reduce((acc: Record<string, number>, click) => {
      const device = click.device_type || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})
    setDeviceData(Object.entries(devices).map(([name, value]) => ({ name, value })))

    // Only show real locations; filter out rows where geo data never resolved
    const locations = clicks.reduce((acc: Record<string, number>, click) => {
      const country = click.country
      if (!country || country === 'Unknown' || country === 'unknown') return acc
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})
    setLocationData(Object.entries(locations).map(([name, value]) => ({ name, value })))

    const daySpan = (() => {
      if (clicks.length === 0) return 1
      const dates = clicks.map(c => new Date(c.clicked_at).getTime())
      const min = Math.min(...dates)
      const max = Math.max(...dates)
      return Math.max(1, Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1)
    })()

    setStats({
      totalClicks: clicks.length,
      uniqueVisitors: new Set(clicks.map(c => c.visitor_id)).size,
      avgClicksPerDay: clicks.length > 0 ? clicks.length / daySpan : 0
    })

    const clicksByDate: Record<string, { date: string; clicks: number; sortKey: string }> = {}

    clicks.forEach((click) => {
      const dateKey = format(new Date(click.clicked_at), 'yyyy-MM-dd')
      const dateLabel = format(new Date(click.clicked_at), 'MMM dd')
      if (!clicksByDate[dateKey]) clicksByDate[dateKey] = { date: dateLabel, clicks: 0, sortKey: dateKey }
      clicksByDate[dateKey].clicks += 1
    })

    const chart = Object.values(clicksByDate)
      .map((entry) => ({ date: entry.date, clicks: entry.clicks }))
      .sort((a, b) => a.date.localeCompare(b.date))

    setChartData(chart)
  }

  const COLORS = ['#14B8A6', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9']
  const isDark = theme === 'dark'
  const chartGridColor = isDark ? '#374151' : '#f0f0f0'
  const chartTextColor = isDark ? '#D1D5DB' : '#374151'

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
    <div className="dashboard-container">
      <PageTitle title="Analytics" />
      <PageWrapper>
        <h1 className="sr-only">Analytics Dashboard</h1>
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 p-8 lg:p-10 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Analytics Dashboard</h1>
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
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <AnimatedCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center">
              <FiMousePointer className="w-4 h-4 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              <CountUp end={stats.totalClicks} duration={2} />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Clicks</p>
        </AnimatedCard>

        <AnimatedCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center">
              <FiEye className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-700 dark:text-cyan-400" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              <CountUp end={stats.uniqueVisitors} duration={2} />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Unique Visitors</p>
        </AnimatedCard>

        <AnimatedCard className="p-4 sm:p-6 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              <CountUp end={stats.avgClicksPerDay} duration={2} decimals={1} />
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Avg Clicks/Day</p>
        </AnimatedCard>
            </div>

      {/* Chart */}
      <AnimatedCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Traffic Overview</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 12 }} />
              <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '0.75rem',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              />
              <Bar dataKey="clicks" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No click data available for this period
          </div>
        )}
      </AnimatedCard>

      {/* Device Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <AnimatedCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Device Distribution</h2>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '0.75rem',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No device data
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Top Countries</h2>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" tick={{ fill: chartTextColor, fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: chartTextColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '0.75rem',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                />
                <Bar dataKey="value" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              No location data
            </div>
          )}
         </AnimatedCard>
       </div>
      </PageWrapper>
    </div>
  )
}

// Main page component with Suspense
export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
}

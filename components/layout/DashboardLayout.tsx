'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  FiHome, FiLink, FiBarChart2, FiSettings, FiShield, FiCode, FiUsers, FiLogOut,
  FiMenu, FiX, FiBell, FiSearch
} from 'react-icons/fi'
import { useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'My Links', href: '/dashboard/links', icon: FiLink },
    { name: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart2 },
    { name: 'QR Codes', href: '/dashboard/qrcodes', icon: FiCode },
    { name: 'Safety', href: '/dashboard/safety', icon: FiShield },
    { name: 'Team', href: '/dashboard/team', icon: FiUsers },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Top Navigation */}
      <div className="glass-card mx-4 mt-4 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition"
          >
            <FiMenu className="w-6 h-6 text-white" />
          </button>
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="gradient-text font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">LinkPlatform</span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search links..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-white/20 rounded-lg transition relative">
            <FiBell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="gradient-text font-semibold">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static top-0 left-0 h-full w-64 gradient-bg z-50 transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-white"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* User Info */}
            <div className="glass-card p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="gradient-text font-bold text-lg">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-white/60 text-sm">Free Plan</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Usage</span>
                  <span>0/100</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
              
              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-red-500/30 rounded-xl transition-all mt-4"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="glass-card p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

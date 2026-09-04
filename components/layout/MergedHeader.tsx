"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import {
  FiBarChart2,
  FiChevronDown,
  FiCode,
  FiLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap,
} from 'react-icons/fi'

interface MergedHeaderProps {
  variant?: 'site' | 'dashboard'
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: FiLink },
  { href: '/dashboard/links', label: 'Links', icon: FiLink },
  { href: '/dashboard/analytics', label: 'Analytics', icon: FiBarChart2 },
  { href: '/dashboard/qrcodes', label: 'QR Codes', icon: FiCode },
]

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
      <motion.div
        whileHover={{ rotate: 10, scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl shadow-md shadow-black/10 ring-1 ring-black/5 flex items-center justify-center"
      >
        <span className="text-lg sm:text-2xl font-bold bg-gradient-to-br from-teal-500 to-cyan-600 bg-clip-text text-transparent">
          L
        </span>
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className={`text-base sm:text-lg font-bold ${dark ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
          LinkPlatform
        </span>
        <span className={`hidden sm:block text-[11px] ${dark ? 'text-gray-500 dark:text-gray-400' : 'text-white/60'}`}>
          Smart URL Shortener
        </span>
      </div>
    </Link>
  )
}

function UserAvatar({ name, email }: { name?: string | null; email?: string | null }) {
  const label = name?.trim()
    ? name.trim().slice(0, 2).toUpperCase()
    : email?.slice(0, 2).toUpperCase() || 'U'
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white/30">
      {label}
    </div>
  )
}

export default function MergedHeader({ variant = 'site' }: MergedHeaderProps) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isDashboard = variant === 'dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const navItemClass = (href: string) =>
    isActive(href)
      ? 'bg-teal-600/15 text-teal-300 dark:text-teal-300 font-medium'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'

  const glassBar =
    'bg-gray-950/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10'

  const siteNav = [
    { href: '/#features', label: 'Features' },
    { href: '/#faq', label: 'FAQ' },
  ]

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isDashboard
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800'
          : scrolled
            ? glassBar
            : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
        <div className={`flex items-center justify-between ${isDashboard ? 'py-2.5 sm:py-3' : 'py-3.5 sm:py-4'} gap-3`}>
          {/* Left: logo */}
          <Logo dark={isDashboard} />

          {/* Center: nav (dashboard) / anchors (site, desktop) */}
          <nav
            aria-label="Primary"
            className={`hidden md:flex items-center gap-1 ${
              isDashboard ? 'mx-auto absolute left-1/2 -translate-x-1/2' : ''
            }`}
          >
            {isDashboard
              ? NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={`px-3.5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${navItemClass(href)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))
              : siteNav.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isDashboard && (
              <div className="relative" ref={userMenuRef}>
                {!loading && user && (
                  <>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="menu"
                      className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserAvatar name={user.name} email={user.email} />
                      <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[140px] truncate">
                        {user.name || user.email}
                      </span>
                      <FiChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          role="menu"
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 shadow-xl shadow-black/10 ring-1 ring-gray-200 dark:ring-gray-700 p-1.5"
                        >
                          <div className="px-3 py-2 mb-1 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          </div>
                          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              role="menuitem"
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${navItemClass(href)}`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                          <button
                            onClick={logout}
                            role="menuitem"
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}

            <ThemeToggle onDark={!isDashboard} />

            {!isDashboard && !loading && !user && (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-1.5"
                >
                  <FiZap className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            )}

            {!isDashboard && !loading && user && (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              className={`p-2 rounded-lg transition-colors md:hidden ${
                isDashboard
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden border-t ${
              isDashboard
                ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800'
                : `bg-gray-950/95 backdrop-blur-xl border-white/10 ${scrolled ? '' : 'mt-0'}`
            }`}
          >
            <nav aria-label="Mobile" className="px-6 py-4 space-y-1">
              {isDashboard
                ? (
                  <>
                    <Link
                      href="/dashboard/links/new"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25 mb-3"
                    >
                      <FiZap className="w-4 h-4" />
                      Create New Link
                    </Link>
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${navItemClass(href)}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )
                : (
                  <>
                    {siteNav.map(({ href, label }) => (
                      <a
                        key={href}
                        href={href}
                        className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                    <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5">
                      {!loading && !user ? (
                        <>
                          <Link
                            href="/login"
                            className="block text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white border border-white/15 transition-colors"
                          >
                            Login
                          </Link>
                          <Link
                            href="/register"
                            className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 transition-all"
                          >
                            Get Started
                          </Link>
                        </>
                      ) : !loading && user ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="block text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white border border-white/15 transition-colors"
                          >
                            Dashboard
                          </Link>
                          <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
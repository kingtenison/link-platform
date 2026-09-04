'use client'

import MergedHeader from '@/components/layout/MergedHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MergedHeader variant="dashboard" />
      <main className="flex-1 w-full">{children}</main>
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 px-8" role="contentinfo">
        <div className="dashboard-container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} LinkPlatform. All rights reserved.</p>
          <p>Built with care for speed, privacy, and simplicity.</p>
        </div>
      </footer>
    </div>
  )
}
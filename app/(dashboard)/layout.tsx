'use client'

import MergedHeader from '@/components/layout/MergedHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MergedHeader variant="dashboard" />
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}
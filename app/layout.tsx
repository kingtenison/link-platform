import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './providers/AuthProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import MergedHeader from '@/components/layout/MergedHeader'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LinkPlatform - Smart URL Shortener',
  description: 'Shorten URLs, track analytics, and stay safe with our link platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <MergedHeader />
            <main className="pt-32">
              {children}
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

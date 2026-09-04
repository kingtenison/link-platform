import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from './providers/AuthProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://linkplatform.io'

export const metadata: Metadata = {
  title: {
    default: 'LinkPlatform — Free URL Shortener with Analytics & QR Codes',
    template: '%s | LinkPlatform',
  },
  description:
    'Shorten any URL for free, track every click with real-time analytics, generate QR codes, and protect links with passwords and expiration dates. Used by thousands worldwide.',
  keywords: [
    'URL shortener',
    'short links',
    'link analytics',
    'QR code generator',
    'click tracking',
    'free URL shortener',
    'link management',
    'bitly alternative',
    'link shortening service',
    'custom short links',
  ],
  authors: [{ name: 'LinkPlatform' }],
  creator: 'LinkPlatform',
  publisher: 'LinkPlatform',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'LinkPlatform',
    title: 'LinkPlatform — Free URL Shortener with Analytics & QR Codes',
    description:
      'Shorten any URL for free, track every click with real-time analytics, generate QR codes, and protect links with passwords and expiration dates.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LinkPlatform — Smart URL Shortener',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkPlatform — Free URL Shortener with Analytics & QR Codes',
    description:
      'Shorten any URL for free, track every click with real-time analytics, generate QR codes, and protect links.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link href="https://fonts.cdnfonts.com/css/tt-fors-trial" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/dyson-modern" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:font-medium"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <MotionConfig reducedMotion="user">
              <main id="main" tabIndex={-1}>
                {children}
              </main>
            </MotionConfig>
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

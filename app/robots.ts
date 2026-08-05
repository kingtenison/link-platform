import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/debug/', '/raw-data/', '/test-analytics/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://linkplatform.io'}/sitemap.xml`,
  }
}

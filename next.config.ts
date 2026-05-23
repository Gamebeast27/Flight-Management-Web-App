import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  // Disable service worker in development to avoid caching headaches
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    // Activate new SW immediately without waiting for old one to expire
    skipWaiting: true,
    clientsClaim: true,
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname === '/bookings',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'bookings-page-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/flights'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'flights-search-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith('/_next/static'),
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js 16 that Turbopack is intentionally
  // configured, suppressing the webpack-plugin conflict warning
  turbopack: {},
}

export default withPWA(nextConfig)

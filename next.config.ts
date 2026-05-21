import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  // Disable service worker in development to avoid caching headaches
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    // Activate new SW immediately without waiting for old one to expire
    skipWaiting: true,
    clientsClaim: true,
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  // Empty turbopack config tells Next.js 16 that Turbopack is intentionally
  // configured, suppressing the webpack-plugin conflict warning
  turbopack: {},
}

export default withPWA(nextConfig)

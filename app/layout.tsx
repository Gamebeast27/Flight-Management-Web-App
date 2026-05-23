import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'FlightMgmt — Search, Book & Manage Flights',
    template: '%s | FlightMgmt',
  },
  description:
    'Search flights, book seats, manage your bookings, reschedule and cancel — all in one place.',
  manifest: '/manifest.json',
  keywords: ['flights', 'booking', 'travel', 'airline'],
  authors: [{ name: 'FlightMgmt' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'FlightMgmt — Search, Book & Manage Flights',
    description: 'Your pocket boarding pass. Search and book flights instantly.',
    siteName: 'FlightMgmt',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans flex flex-col">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  )
}

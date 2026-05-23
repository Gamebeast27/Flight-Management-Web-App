'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/useUserStore'
import { BookingCard } from './BookingCard'
import type { BookingWithFullDetails } from '../page'

interface BookingsListProps {
  initialBookings: BookingWithFullDetails[]
}

export function BookingsList({ initialBookings }: BookingsListProps) {
  const cachedBookings = useUserStore((s) => s.cachedBookings)
  const [isOffline, setIsOffline] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setIsOffline(!navigator.onLine)

    const handleOnline = () => {
      setIsOffline(false)
      // Sync on recovery of connection
      useUserStore.getState().setCachedBookings(initialBookings)
    }
    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.onLine) {
      useUserStore.getState().setCachedBookings(initialBookings)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [initialBookings])

  const displayBookings = mounted ? cachedBookings : initialBookings

  return (
    <div className="flex flex-col gap-6">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-xl flex items-center gap-3 animate-fade-in shadow-lg shadow-amber-500/5">
          <div className="rounded-full bg-amber-500/20 p-2 text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">You are currently offline</p>
            <p className="text-xs text-amber-200/80 mt-0.5">Showing last synced data. Certain actions (cancelling or rescheduling) are locked until connection returns.</p>
          </div>
        </div>
      )}

      {/* Bookings Render */}
      {displayBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 backdrop-blur-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-500 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12h-15m0 0l3-3m-3 3l3 3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No bookings found</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            You do not have any bookings registered to your account yet. Ready to start your next adventure?
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-sm font-semibold px-5 py-2.5 transition-all"
          >
            Search Flights
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {displayBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}

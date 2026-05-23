'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { formatDate, formatTime, formatPrice } from '@/lib/utils/format'

export default function OfflinePage() {
  const cachedBookings = useUserStore((s) => s.cachedBookings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  function handleRetry() {
    window.location.href = '/'
  }

  // Display badges styling
  const BADGES: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    rescheduled: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    cancelled: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/5 blur-3xl" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-8">
        {/* Status Illustration */}
        <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-center text-slate-500 mb-6 shadow-2xl relative">
          {/* Pulse light */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500" />
          
          <svg className="w-10 h-10 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white text-center">Connection Lost</h1>
        <p className="text-sm text-slate-400 mt-2 text-center max-w-sm leading-relaxed">
          It looks like you are disconnected. Please check your network and retry.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold px-5 py-3 transition-all active:scale-95 shadow-md shadow-sky-600/10 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Retry Connection
          </button>
        </div>

        {/* Offline Bookings View */}
        {mounted && cachedBookings.length > 0 && (
          <div className="w-full mt-12 pt-8 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left mb-5">
              ✈️ Your Offline Boarding Passes
            </h3>
            
            <div className="flex flex-col gap-4">
              {cachedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-850 bg-slate-900/30 p-5 flex flex-col gap-4 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PNR</span>
                      <span className="text-xs font-extrabold text-white font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40 select-all">
                        {booking.pnr_code}
                      </span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${BADGES[booking.status] || ''}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-black text-white">{formatTime(booking.flights.departs_at)}</p>
                      <p className="text-xs font-bold text-sky-400">{booking.flights.origin}</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center max-w-[100px]">
                      <span className="text-[9px] text-slate-500 font-bold">{booking.flights.flight_no}</span>
                      <div className="w-full h-px bg-slate-850 my-1" />
                      <span className="text-[9px] text-slate-500">{formatDate(booking.flights.departs_at)}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-white">{formatTime(booking.flights.arrives_at)}</p>
                      <p className="text-xs font-bold text-sky-400">{booking.flights.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-850/60 pt-3">
                    <div>
                      <span>Seat <strong>{booking.seats.seat_number}</strong></span>
                      <span className="text-[10px] text-slate-500 capitalize ml-1">({booking.seats.class})</span>
                    </div>
                    <strong className="text-slate-200">{formatPrice(booking.total_price)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-[10px] text-slate-600 mt-8">
        FlightMgmt Offline Mode · Last updated automatically on sync
      </footer>
    </div>
  )
}

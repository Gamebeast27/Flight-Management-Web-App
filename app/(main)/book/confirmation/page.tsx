import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResetButton } from './_components/ResetButton'
import { formatTime, formatDate, formatPrice, formatDuration } from '@/lib/utils/format'
import type { BookingWithDetails } from '@/types/booking'

export const metadata: Metadata = {
  title: 'Booking Confirmed! | FlightMgmt',
}

interface ConfirmationPageProps {
  searchParams: Promise<{ bookingId?: string; pnr?: string }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { bookingId, pnr } = await searchParams

  if (!bookingId) return notFound()

  const supabase = await createClient()

  // Verify the authenticated user owns this booking
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, flights(*), seats(*)')
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return notFound()

  const booking = data as unknown as BookingWithDetails
  const { flights: flight, seats: seat } = booking

  // Parse PNRs — multi-seat sends comma-separated list (e.g. "ABC123,DEF456")
  const pnrList: string[] = pnr
    ? pnr.split(',').map((p) => p.trim()).filter(Boolean)
    : [booking.pnr_code]

  const duration = formatDuration(flight.departs_at, flight.arrives_at)

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Success banner */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-slate-400 mt-2">
          {pnrList.length > 1
            ? `${pnrList.length} seats reserved. Safe travels! ✈️`
            : 'Your seat is reserved. Safe travels! ✈️'}
        </p>
      </div>

      {/* PNR card */}
      <div className="rounded-2xl border border-sky-500/40 bg-gradient-to-br from-sky-950/60 to-blue-950/60 p-6 mb-6 text-center shadow-xl shadow-sky-900/20">
        <p className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-3">
          PNR / Booking Reference{pnrList.length > 1 ? 's' : ''}
        </p>
        {pnrList.length === 1 ? (
          <p className="text-5xl font-black tracking-widest text-white font-mono">
            {pnrList[0]}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {pnrList.map((code, i) => (
              <div key={code} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Passenger {i + 1}</span>
                <span className="text-2xl font-black tracking-widest text-white font-mono bg-white/5 rounded-xl px-4 py-2 border border-sky-500/20">{code}</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-3">
          Show this code at the airport or online check-in
        </p>
      </div>

      {/* Itinerary card */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 divide-y divide-slate-700/60 mb-6">
        {/* Flight section */}
        <div className="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Flight</p>
          <div className="flex items-center gap-4">
            {/* Depart */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.departs_at)}</p>
              <p className="text-sm font-bold text-sky-400">{flight.origin}</p>
              <p className="text-xs text-slate-500">{formatDate(flight.departs_at)}</p>
            </div>

            {/* Duration */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{duration}</span>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-700" />
                <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <span className="text-xs text-slate-600">{flight.flight_no}</span>
            </div>

            {/* Arrive */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(flight.arrives_at)}</p>
              <p className="text-sm font-bold text-sky-400">{flight.destination}</p>
              <p className="text-xs text-slate-500">{formatDate(flight.arrives_at)}</p>
            </div>
          </div>
        </div>

        {/* Seat section */}
        <div className="p-5 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seat</p>
            <p className="text-2xl font-black text-white">{seat.seat_number}</p>
            <p className="text-xs text-slate-500 capitalize mt-0.5">{seat.class} class</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aircraft</p>
            <p className="text-sm text-white font-medium">{flight.aircraft_type}</p>
          </div>
        </div>

        {/* Price section */}
        <div className="p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Price Breakdown</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Base fare</span>
              <span>{formatPrice(flight.base_price)}</span>
            </div>
            {seat.extra_fee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Seat class upgrade</span>
                <span>{formatPrice(seat.extra_fee)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-white text-base pt-2 border-t border-slate-700/60 mt-1">
              <span>Total charged</span>
              <span className="text-emerald-400">{formatPrice(booking.total_price)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <ResetButton />
        <Link
          href="/bookings"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-700/60 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-200"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  )
}

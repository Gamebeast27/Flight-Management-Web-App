import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SeatGrid } from './_components/SeatGrid'
import { formatTime, formatDate, formatPrice } from '@/lib/utils/format'
import type { Database } from '@/types/supabase'

export const metadata: Metadata = { title: 'Select a Seat | FlightMgmt' }

type SeatClass = Database['public']['Tables']['seats']['Row']['class']

interface SeatsPageProps {
  searchParams: Promise<{ flightId?: string; class?: string }>
}

export default async function SeatsPage({ searchParams }: SeatsPageProps) {
  const params = await searchParams
  const { flightId, class: cabinClass = 'economy' } = params

  if (!flightId) return notFound()

  const supabase = await createClient()

  // Fetch user, flight + all seats in parallel
  const [
    { data: { user } },
    { data: flight, error: flightError },
    { data: seats, error: seatsError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('flights').select('*').eq('id', flightId).single(),
    supabase
      .from('seats')
      .select('*')
      .eq('flight_id', flightId)
      .order('seat_number', { ascending: true }),
  ])

  if (flightError || !flight || seatsError || !seats) return notFound()

  // Fetch user's confirmed bookings for this flight
  let userBookedSeatIds: string[] = []
  if (user) {
    const { data: userBookings } = await supabase
      .from('bookings')
      .select('seat_id')
      .eq('user_id', user.id)
      .eq('flight_id', flightId)
      .eq('status', 'confirmed')

    if (userBookings) {
      userBookedSeatIds = userBookings.map((b) => b.seat_id)
    }
  }

  const validClass = (['economy', 'business', 'first'] as SeatClass[]).includes(
    cabinClass as SeatClass
  )
    ? (cabinClass as SeatClass)
    : 'economy'

  const available = seats.filter((s) => s.is_available).length

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-sky-400 transition-colors">Search</Link>
        <span>›</span>
        <Link href="/flights" className="hover:text-sky-400 transition-colors">Flights</Link>
        <span>›</span>
        <span className="text-slate-300">Select Seat</span>
      </div>

      {/* Flight summary banner */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{formatTime(flight.departs_at)}</p>
            <p className="text-sm font-bold text-sky-400">{flight.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <p className="text-xs text-slate-500 font-semibold">{flight.flight_no}</p>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="flex-1 h-px bg-slate-700" />
              <svg className="w-3.5 h-3.5 text-sky-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <p className="text-xs text-slate-600">{formatDate(flight.departs_at)}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{formatTime(flight.arrives_at)}</p>
            <p className="text-sm font-bold text-sky-400">{flight.destination}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-500">From</p>
          <p className="text-xl font-extrabold text-white">{formatPrice(flight.base_price)}</p>
          <p className="text-xs text-slate-500">{available} seats available</p>
        </div>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">
        Choose your seat
        <span className="ml-2 text-sm font-normal text-slate-400 capitalize">
          — {validClass} class highlighted
        </span>
      </h1>

      <SeatGrid key={flightId} seats={seats} selectedClass={validClass} userBookedSeatIds={userBookedSeatIds} />
    </div>
  )
}

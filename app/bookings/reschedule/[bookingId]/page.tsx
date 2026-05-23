import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { RescheduleView } from './_components/RescheduleView'
import type { Database } from '@/types/supabase'
import type { BookingWithFullDetails } from '../../page'

type FlightRow = Database['public']['Tables']['flights']['Row']

export interface AltFlightSeat {
  id: string
  class: string
  is_available: boolean
  extra_fee: number
}

export interface AltFlightWithSeats extends FlightRow {
  seats: AltFlightSeat[]
}

export const metadata: Metadata = {
  title: 'Reschedule Flight | FlightMgmt',
}

interface ReschedulePageProps {
  params: Promise<{ bookingId: string }>
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const { bookingId } = await params

  const supabase = await createClient()

  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch the booking with flight and seat info
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('id', bookingId)
    .single()

  if (bookingError || !bookingData) {
    return notFound()
  }

  const booking = bookingData as BookingWithFullDetails

  // 3. Authorization Check
  if (booking.user_id !== user.id) {
    return notFound()
  }

  // 4. Block if booking is already cancelled
  if (booking.status === 'cancelled') {
    redirect('/bookings')
  }

  // 5. Check if the CURRENT flight departure is within 2 hours
  const departureTime = new Date(booking.flights.departs_at).getTime()
  // eslint-disable-next-line react-hooks/purity
  const currentTime = Date.now()
  const hoursRemaining = (departureTime - currentTime) / (1000 * 60 * 60)
  
  if (hoursRemaining < 2) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6 animate-pulse">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Reschedule Locked</h1>
          <p className="text-slate-400 max-w-md mb-6 text-sm">
            Flights departing in less than 2 hours cannot be rescheduled or cancelled. Your flight ({booking.flights.flight_no}) departs at {new Date(booking.flights.departs_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          </p>
          <Link
            href="/bookings"
            className="rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 px-5 py-2.5 text-slate-200 text-sm font-semibold transition-all"
          >
            Back to Bookings
          </Link>
        </main>
      </div>
    )
  }

  // 6. Fetch alternative flights on the same route
  const { data: altFlightsData } = await supabase
    .from('flights')
    .select(`
      *,
      seats (
        id,
        class,
        is_available,
        extra_fee
      )
    `)
    .eq('origin', booking.flights.origin)
    .eq('destination', booking.flights.destination)
    .neq('id', booking.flights.id)
    .gt('departs_at', new Date().toISOString())
    .in('status', ['scheduled', 'delayed'])
    .order('departs_at', { ascending: true })

  const altFlights = (altFlightsData || []) as AltFlightWithSeats[]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-slate-950 -z-10">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-sky-600/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-blue-700/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 select-none">
            <Link href="/bookings" className="hover:text-sky-400 transition-colors">Bookings</Link>
            <span>›</span>
            <span className="text-slate-300">Reschedule flight</span>
          </div>

          <RescheduleView booking={booking} altFlights={altFlights} />
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600 mt-12">
        © {new Date().getFullYear()} FlightMgmt · Built with Next.js &amp; Supabase
      </footer>
    </div>
  )
}

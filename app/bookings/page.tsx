import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { BookingCard } from './_components/BookingCard'
import type { BookingWithDetails } from '@/types/booking'
import type { Database } from '@/types/supabase'

type PassengerRow = Database['public']['Tables']['passengers']['Row']

// Extend BookingWithDetails to include passengers for full display
export interface BookingWithFullDetails extends BookingWithDetails {
  passengers?: PassengerRow[]
}

export const metadata: Metadata = {
  title: 'My Bookings | FlightMgmt',
  description: 'Manage your flight reservations, reschedule flights, and cancel bookings.',
}

export default async function BookingsPage() {
  const supabase = await createClient()

  // 1. Auth Gate
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login?next=/bookings')
  }

  // 2. Fetch all bookings with details for this user
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      flights (*),
      seats (*),
      passengers (*)
    `)
    .eq('user_id', user.id)
    .order('booked_at', { ascending: false })

  if (bookingsError) {
    console.error('Failed to fetch bookings:', bookingsError.message)
  }

  const typedBookings = (bookings || []) as BookingWithFullDetails[]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 bg-slate-950 -z-10">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] rounded-full bg-sky-600/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-800/60">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">My Bookings</h1>
              <p className="text-sm text-slate-400 mt-1">
                View your ticketing history, reschedule flights, or cancel reservations.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 transition-all shadow-md shadow-sky-600/10 active:scale-95 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Book New Flight
            </Link>
          </div>

          {/* Bookings List */}
          {typedBookings.length === 0 ? (
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
              {typedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600 mt-12">
        © {new Date().getFullYear()} FlightMgmt · Built with Next.js &amp; Supabase
      </footer>
    </div>
  )
}

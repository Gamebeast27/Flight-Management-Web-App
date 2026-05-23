import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { BookingsList } from './_components/BookingsList'
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

          {/* Bookings List (with offline support) */}
          <BookingsList initialBookings={typedBookings} />
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-600 mt-12">
        © {new Date().getFullYear()} FlightMgmt · Built with Next.js &amp; Supabase
      </footer>
    </div>
  )
}

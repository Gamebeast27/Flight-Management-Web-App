import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FlightCard } from './_components/FlightCard'
import { formatShortDate } from '@/lib/utils/format'
import { AIRPORTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Flight Results | FlightMgmt',
}

interface FlightsPageProps {
  searchParams: Promise<{
    origin?: string
    destination?: string
    date?: string
    class?: string
    passengers?: string
  }>
}

function getCity(code: string): string {
  return AIRPORTS.find((a) => a.code === code)?.city ?? code
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams
  const { origin, destination, date, class: cabinClass = 'economy', passengers = '1' } = params

  // ── Validation ────────────────────────────────────────────────────────────
  if (!origin || !destination || !date) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-400">Invalid search. Please go back and try again.</p>
        <Link href="/" className="mt-4 inline-block text-sky-400 hover:text-sky-300 font-medium">
          ← Back to search
        </Link>
      </div>
    )
  }

  // ── Fetch matching flights server-side ────────────────────────────────────
  const supabase = await createClient()

  const dayStart = `${date}T00:00:00+05:30`
  const dayEnd   = `${date}T23:59:59+05:30`

  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('departs_at', dayStart)
    .lte('departs_at', dayEnd)
    .in('status', ['scheduled', 'delayed'])
    .order('departs_at', { ascending: true })

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-red-400">Failed to load flights. Please try again.</p>
        <Link href="/" className="mt-4 inline-block text-sky-400 hover:text-sky-300 font-medium">← Back to search</Link>
      </div>
    )
  }

  const formattedDate = formatShortDate(`${date}T12:00:00`)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-sky-400 transition-colors">Search</Link>
          <span>›</span>
          <span className="text-slate-300">Flights</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {getCity(origin)} <span className="text-sky-400">→</span> {getCity(destination)}
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          {formattedDate} · {passengers} passenger{Number(passengers) > 1 ? 's' : ''} ·{' '}
          <span className="capitalize">{cabinClass}</span>
        </p>
      </div>

      {/* Results */}
      {flights.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-12 text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-300 font-semibold text-lg mb-1">No flights found</p>
          <p className="text-slate-500 text-sm mb-6">
            No {cabinClass} flights from {origin} to {destination} on {formattedDate}.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-bold text-white transition-colors"
          >
            ← Modify Search
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500">
            {flights.length} flight{flights.length > 1 ? 's' : ''} found
          </p>
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              cabinClass={cabinClass}
            />
          ))}
        </div>
      )}
    </div>
  )
}

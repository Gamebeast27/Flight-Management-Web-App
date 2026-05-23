'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { formatTime, formatDuration, formatPrice } from '@/lib/utils/format'
import type { Database } from '@/types/supabase'

type FlightRow = Database['public']['Tables']['flights']['Row']

const CLASS_BADGE: Record<string, string> = {
  economy:  'bg-slate-700 text-slate-300',
  business: 'bg-amber-500/20 text-amber-400',
  first:    'bg-purple-500/20 text-purple-400',
}

interface FlightCardProps {
  flight: FlightRow
  cabinClass: string
}

export function FlightCard({ flight, cabinClass }: FlightCardProps) {
  const router          = useRouter()
  const setFlight       = useFlightStore((s) => s.setFlight)
  const activeSearch    = useFlightStore((s) => s.activeSearchQuery)
  const passengerCount  = activeSearch?.passengerCount ?? 1

  function handleSelect() {
    setFlight(flight)
    router.push(
      `/book/seats?flightId=${flight.id}&class=${cabinClass}&passengers=${passengerCount}`
    )
  }

  const duration = formatDuration(flight.departs_at, flight.arrives_at)

  const extraFee = cabinClass === 'business' ? 3000 : cabinClass === 'first' ? 8000 : 0
  const totalPrice = flight.base_price + extraFee

  return (
    <article className="group rounded-2xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800/60 hover:border-sky-500/40 transition-all duration-200 p-5 sm:p-6 shadow-md hover:shadow-sky-500/10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Flight info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              {flight.flight_no}
            </span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">{flight.aircraft_type}</span>
            <span
              className={`ml-auto sm:ml-0 text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${CLASS_BADGE[cabinClass] ?? CLASS_BADGE['economy']}`}
            >
              {cabinClass}
            </span>
          </div>

          {/* Route timeline */}
          <div className="flex items-center gap-3">
            {/* Depart */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white tabular-nums">
                {formatTime(flight.departs_at)}
              </p>
              <p className="text-sm font-bold text-sky-400 mt-0.5">{flight.origin}</p>
            </div>

            {/* Duration line */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-[80px]">
              <span className="text-xs text-slate-500">{duration}</span>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-px bg-slate-700" />
                <svg className="w-4 h-4 text-sky-500 mx-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <span className="text-xs text-slate-600">Direct</span>
            </div>

            {/* Arrive */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white tabular-nums">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="text-sm font-bold text-sky-400 mt-0.5">{flight.destination}</p>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 sm:min-w-[140px]">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">
              {cabinClass !== 'economy' && (
                <span className="line-through text-slate-600 mr-1">
                  {formatPrice(flight.base_price)}
                </span>
              )}
            </p>
            <p className="text-2xl font-extrabold text-white">
              {formatPrice(totalPrice)}
            </p>
            <p className="text-xs text-slate-500">per person</p>
          </div>
          <button
            onClick={handleSelect}
            className="shrink-0 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 shadow-md shadow-sky-500/20 hover:shadow-sky-400/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            Select Seat →
          </button>
        </div>
      </div>
    </article>
  )
}

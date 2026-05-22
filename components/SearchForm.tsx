'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { AIRPORTS, CABIN_CLASSES } from '@/lib/constants'
import { todayISO } from '@/lib/utils/format'
import type { FlightSearchQuery } from '@/types/store'
import type { SeatRow } from '@/types/store'

export function SearchForm() {
  const router   = useRouter()
  const setSearch = useFlightStore((s) => s.setSearch)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const query: FlightSearchQuery = {
      origin:         fd.get('origin')         as string,
      destination:    fd.get('destination')    as string,
      date:           fd.get('date')           as string,
      cabinClass:     fd.get('cabinClass')     as SeatRow['class'],
      passengerCount: Number(fd.get('passengers') ?? 1),
    }

    setSearch(query)
    router.push(
      `/flights?origin=${query.origin}&destination=${query.destination}&date=${query.date}&class=${query.cabinClass}&passengers=${query.passengerCount}`
    )
  }

  const today = todayISO()

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {/* Origin */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-origin" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          From
        </label>
        <select
          id="search-origin"
          name="origin"
          required
          defaultValue=""
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>Select origin</option>
          {AIRPORTS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.city}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-destination" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          To
        </label>
        <select
          id="search-destination"
          name="destination"
          required
          defaultValue=""
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>Select destination</option>
          {AIRPORTS.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.city}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-date" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Date
        </label>
        <input
          id="search-date"
          name="date"
          type="date"
          required
          min={today}
          defaultValue={today}
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all [color-scheme:dark] cursor-pointer"
        />
      </div>

      {/* Cabin class */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-class" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Class
        </label>
        <select
          id="search-class"
          name="cabinClass"
          defaultValue="economy"
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          {CABIN_CLASSES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Passengers */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="search-passengers" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Passengers
        </label>
        <input
          id="search-passengers"
          name="passengers"
          type="number"
          min={1}
          max={9}
          defaultValue={1}
          required
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Submit — spans full width */}
      <div className="sm:col-span-2 lg:col-span-5">
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          Search Flights →
        </button>
      </div>
    </form>
  )
}

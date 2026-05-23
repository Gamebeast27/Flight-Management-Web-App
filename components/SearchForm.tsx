'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { AIRPORTS, CABIN_CLASSES } from '@/lib/constants'
import { todayISO } from '@/lib/utils/format'
import type { FlightSearchQuery } from '@/types/store'
import type { SeatRow } from '@/types/store'

export function SearchForm() {
  const router = useRouter()
  const setSearch = useFlightStore((s) => s.setSearch)

  const today = todayISO()

  // Controlled component states
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState(today)
  const [cabinClass, setCabinClass] = useState<SeatRow['class']>('economy')
  const [passengers, setPassengers] = useState(1)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const query: FlightSearchQuery = {
      origin,
      destination,
      date,
      cabinClass,
      passengerCount: passengers,
    }

    setSearch(query)
    router.push(
      `/flights?origin=${query.origin}&destination=${query.destination}&date=${query.date}&class=${query.cabinClass}&passengers=${query.passengerCount}`
    )
  }

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
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
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
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
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
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as SeatRow['class'])}
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
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          required
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Submit — spans full width */}
      <div className="sm:col-span-2 lg:col-span-5">
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          Search Flights →
        </button>
      </div>

      {/* Seeded Demo Shortcuts */}
      <div className="sm:col-span-2 lg:col-span-5 border-t border-slate-800/60 pt-4 mt-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center sm:text-left">
          💡 Demo Shortcuts — Try these today
        </p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <button
            type="button"
            onClick={() => { setOrigin('DEL'); setDestination('BOM'); setDate('2026-05-24') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            DEL → BOM (24 May)
          </button>
          <button
            type="button"
            onClick={() => { setOrigin('BOM'); setDestination('BLR'); setDate('2026-05-25') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            BOM → BLR (25 May)
          </button>
          <button
            type="button"
            onClick={() => { setOrigin('DEL'); setDestination('BLR'); setDate('2026-05-26') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            DEL → BLR (26 May)
          </button>
          <button
            type="button"
            onClick={() => { setOrigin('BOM'); setDestination('HYD'); setDate('2026-05-27') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            BOM → HYD (27 May)
          </button>
          <button
            type="button"
            onClick={() => { setOrigin('BLR'); setDestination('DEL'); setDate('2026-05-28') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            BLR → DEL (28 May)
          </button>
          <button
            type="button"
            onClick={() => { setOrigin('HYD'); setDestination('BOM'); setDate('2026-05-29') }}
            className="text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer font-medium"
          >
            HYD → BOM (29 May)
          </button>
        </div>
      </div>
    </form>
  )
}


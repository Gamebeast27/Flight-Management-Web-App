import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { SearchForm } from '@/components/SearchForm'
import { AVAILABLE_ROUTES, AIRPORTS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'FlightMgmt — Search & Book Flights',
  description: 'Search flights across DEL, BOM, BLR and HYD. Book seats, manage bookings and more.',
}

function getAirportCity(code: string): string {
  return AIRPORTS.find((a) => a.code === code)?.city ?? code
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-sky-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-blue-700/10 blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Headline */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-400 uppercase tracking-widest mb-6">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              Book your next flight
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Fly anywhere,{' '}
              <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                book instantly
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Search real-time availability, pick your seat, and get your PNR code in seconds.
            </p>
          </div>

          {/* Search card */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
            <SearchForm />
          </div>

          {/* Available routes */}
          <div className="mt-12 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Available routes
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {AVAILABLE_ROUTES.map((r) => (
                <span
                  key={`${r.origin}-${r.destination}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 px-4 py-1.5 text-sm text-slate-300"
                >
                  <span className="font-bold text-white">{r.origin}</span>
                  <span className="text-slate-500">({getAirportCity(r.origin)})</span>
                  <svg className="w-3.5 h-3.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-bold text-white">{r.destination}</span>
                  <span className="text-slate-500">({getAirportCity(r.destination)})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} FlightMgmt · Built with Next.js &amp; Supabase
      </footer>
    </div>
  )
}

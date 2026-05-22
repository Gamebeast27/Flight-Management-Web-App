import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication | FlightMgmt',
}

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
      {/* Brand mark */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-sky-400 group-hover:text-sky-300 transition-colors"
          aria-hidden="true"
        >
          <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-white">
          Flight<span className="text-sky-400">Mgmt</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/80 backdrop-blur-md shadow-2xl p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} FlightMgmt. All rights reserved.
      </p>
    </div>
  )
}

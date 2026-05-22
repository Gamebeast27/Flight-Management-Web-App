import type { Metadata } from 'next'
import Link from 'next/link'
import { PassengerForm } from './_components/PassengerForm'
import { BackButton } from '@/components/BackButton'

export const metadata: Metadata = {
  title: 'Passenger Details | FlightMgmt',
}

export default function DetailsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-sky-400 transition-colors">Search</Link>
        <span>›</span>
        <Link href="/flights" className="hover:text-sky-400 transition-colors">Flights</Link>
        <span>›</span>
        <BackButton label="Seats" />
        <span>›</span>
        <span className="text-slate-300">Passenger Details</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
        Passenger Details
      </h1>

      <PassengerForm />
    </div>
  )
}

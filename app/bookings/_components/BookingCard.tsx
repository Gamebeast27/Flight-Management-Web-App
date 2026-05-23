'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'
import { cancelBookingAction } from '@/app/actions/bookingManagement'
import { formatTime, formatDate, formatPrice } from '@/lib/utils/format'
import type { BookingWithFullDetails } from '../page'

interface BookingCardProps {
  booking: BookingWithFullDetails
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const flight = booking.flights
  const seat = booking.seats
  const passengers = booking.passengers || []

  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    setCurrentTime(Date.now())
  }, [])

  // Check cancellation/reschedule eligibility (departure must be > 2 hours in the future)
  const departureTime = new Date(flight.departs_at).getTime()
  const isCancelled = booking.status === 'cancelled'
  const isPast = currentTime ? departureTime < currentTime : false
  const hoursRemaining = currentTime ? (departureTime - currentTime) / (1000 * 60 * 60) : 999
  const isLockedByTime = currentTime ? hoursRemaining < 2 && !isCancelled && !isPast : false

  const canAction = mounted && !isCancelled && !isPast && !isLockedByTime

  // Badge styles mapping
  const BADGES = {
    confirmed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    rescheduled: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    cancelled: 'bg-rose-500/10 text-rose-500 border border-rose-500/30',
  }

  async function handleCancel() {
    setIsCancelling(true)
    setErrorMessage(null)

    try {
      const res = await cancelBookingAction(booking.id)
      if (res.success) {
        // Clear zustand stores as required
        useFlightStore.getState().resetBooking()
        useUserStore.getState().clearCachedBookings()
        
        setShowCancelModal(false)
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to cancel this booking.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(msg)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl p-5 sm:p-6 transition-all hover:border-slate-700/60 shadow-lg">
        {/* Top bar: PNR + Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">PNR Code</span>
            <span className="text-base font-extrabold text-white font-mono bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/40 select-all">
              {booking.pnr_code}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${BADGES[booking.status]}`}>
              {booking.status}
            </span>
            {isPast && !isCancelled && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase bg-slate-800 text-slate-400 border border-slate-700/40">
                Flown
              </span>
            )}
          </div>
        </div>

        {/* Middle part: Flight itinerary */}
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-5 flex-1 w-full">
            {/* Origin */}
            <div className="text-left min-w-[70px]">
              <p className="text-2xl font-black text-white">{formatTime(flight.departs_at)}</p>
              <p className="text-sm font-bold text-sky-400">{flight.origin}</p>
            </div>

            {/* Flight Connection Line */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-500">{flight.flight_no}</span>
              <div className="w-full flex items-center gap-1.5 my-1.5">
                <div className="flex-1 h-px bg-slate-800" />
                <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{formatDate(flight.departs_at)}</span>
            </div>

            {/* Destination */}
            <div className="text-right min-w-[70px]">
              <p className="text-2xl font-black text-white">{formatTime(flight.arrives_at)}</p>
              <p className="text-sm font-bold text-sky-400">{flight.destination}</p>
            </div>
          </div>

          <div className="h-px w-full md:h-12 md:w-px bg-slate-850" />

          {/* Pricing & Seat */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
            <div className="text-left md:text-right">
              <p className="text-xs text-slate-500">Seat Assignment</p>
              <p className="text-sm font-bold text-slate-200">
                {seat.seat_number} <span className="text-xs text-slate-500 font-normal capitalize">({seat.class})</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total Price Paid</p>
              <p className="text-lg font-black text-white">{formatPrice(booking.total_price)}</p>
            </div>
          </div>
        </div>

        {/* Passenger details expandable details */}
        {passengers.length > 0 && (
          <div className="mt-2 mb-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Passenger Details</p>
            {passengers.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-200">{p.full_name}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">DOB: {p.dob}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Passport: <strong className="text-slate-300 font-semibold">{p.passport_no}</strong></span>
                  <span>Nationality: <strong className="text-slate-300 font-semibold">{p.nationality}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
          <div>
            {isLockedByTime && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Locks: within 2 hours of departure
              </span>
            )}
            {isCancelled && (
              <span className="text-xs text-slate-500 font-medium italic">
                Booking has been cancelled
              </span>
            )}
            {isPast && !isCancelled && (
              <span className="text-xs text-slate-500 font-medium italic">
                Past flight
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canAction && (
              <>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 text-xs font-bold px-4 py-2.5 transition-all active:scale-95 cursor-pointer"
                >
                  Cancel Booking
                </button>
                <Link
                  href={`/bookings/reschedule/${booking.id}`}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs font-bold px-4 py-2.5 transition-all active:scale-95 text-center"
                >
                  Reschedule Flight
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => !isCancelling && setShowCancelModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all scale-100">
            <h3 className="text-lg font-bold text-white mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure? This cannot be undone. Your seat <strong className="text-white font-bold">{seat.seat_number}</strong> on flight <strong className="text-white font-bold">{flight.flight_no}</strong> will be released back into public inventory.
            </p>

            {errorMessage && (
              <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className="rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, Go Back
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 transition-all cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

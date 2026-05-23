'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { rescheduleBookingAction } from '@/app/actions/bookingManagement'
import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'
import { formatTime, formatDate, formatDuration, formatPrice } from '@/lib/utils/format'
import type { BookingWithFullDetails } from '../../../page'
import type { AltFlightWithSeats } from '../page'

interface RescheduleViewProps {
  booking: BookingWithFullDetails
  altFlights: AltFlightWithSeats[]
}

export function RescheduleView({ booking, altFlights }: RescheduleViewProps) {
  const router = useRouter()
  const [selectedFlight, setSelectedFlight] = useState<AltFlightWithSeats | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const currentFlight = booking.flights
  const currentSeat = booking.seats
  const userClass = currentSeat.class

  // Compute alternative flights list with pricing and availability metrics
  const processedFlights = altFlights.map((flight) => {
    // Filter seats to match the class originally booked by the user
    const classSeats = flight.seats.filter(
      (s) => s.class === userClass && s.is_available
    )
    const seatsAvailableCount = classSeats.length
    const hasSeats = seatsAvailableCount > 0

    let priceDiff = 0
    let firstSeatId: string | null = null

    if (hasSeats) {
      // Find the first available seat to calculate the seat fee
      const firstSeat = classSeats.sort((a, b) => a.id.localeCompare(b.id))[0]
      if (firstSeat) {
        firstSeatId = firstSeat.id

        // Calculate total new price: base + seat extra_fee
        const newTotalPrice = Number(flight.base_price) + Number(firstSeat.extra_fee)
        const oldTotalPrice = Number(booking.total_price)

        // Only charge positive differences, negative difference is 0 (no refund)
        priceDiff = Math.max(0, newTotalPrice - oldTotalPrice)
      }
    }

    return {
      flight,
      hasSeats,
      seatsAvailableCount,
      priceDiff,
      firstSeatId,
    }
  })

  // Filter out flights that don't have available seats in the user's booking class
  const availableAltFlights = processedFlights.filter((f) => f.hasSeats)

  async function handleConfirmReschedule() {
    if (!selectedFlight) return
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await rescheduleBookingAction(booking.id, selectedFlight.id)
      if (res.success) {
        // Clear Zustand store caches as required
        useFlightStore.getState().resetBooking()
        useUserStore.getState().clearCachedBookings()

        setShowConfirmModal(false)
        router.push('/bookings')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to reschedule flight.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSelectFlight(flight: AltFlightWithSeats) {
    setSelectedFlight(flight)
    setErrorMessage(null)
    setShowConfirmModal(true)
  }

  // Calculate selected flight details for the confirmation modal
  const selectedProcessed = selectedFlight
    ? processedFlights.find((f) => f.flight.id === selectedFlight.id)
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Reschedule Your Flight</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your current itinerary and select a new flight on the same route.
        </p>
      </div>

      {/* Current booking card (minified summary) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col md:flex-row md:items-center gap-6 justify-between relative overflow-hidden">
        {/* Decorative subtle border left */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-sky-500" />

        <div className="flex flex-col gap-1.5 pl-2">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Current Booking</span>
          <div className="flex items-center gap-2 text-lg font-black text-white">
            <span>{currentFlight.origin}</span>
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span>{currentFlight.destination}</span>
          </div>
          <p className="text-xs text-slate-400">
            Flight: <strong className="text-slate-200 font-semibold">{currentFlight.flight_no}</strong> · Departs: {formatDate(currentFlight.departs_at)} at {formatTime(currentFlight.departs_at)}
          </p>
        </div>

        <div className="flex items-center gap-6 self-start md:self-auto pl-2 md:pl-0">
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-500 block">Class &amp; Seat</span>
            <span className="text-sm font-bold text-slate-300 capitalize">{userClass} Class · Seat {currentSeat.seat_number}</span>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-500 block">Original Price</span>
            <span className="text-sm font-bold text-slate-300">{formatPrice(booking.total_price)}</span>
          </div>
        </div>
      </div>

      {/* Alternative Flights Section */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Available Alternative Flights</h2>

        {availableAltFlights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-10 text-center">
            <div className="mx-auto w-10 h-10 rounded-xl bg-slate-800/40 flex items-center justify-center text-slate-500 mb-3.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-300 mb-1">No alternative flights found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no other scheduled upcoming flights on the same route ({currentFlight.origin} to {currentFlight.destination}) with available seats in {userClass} class.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {availableAltFlights.map(({ flight, seatsAvailableCount, priceDiff }) => (
              <div
                key={flight.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/20 hover:border-slate-700/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Flight route timing timeline */}
                <div className="flex items-center gap-5 flex-1">
                  <div className="text-left min-w-[60px]">
                    <p className="text-lg font-extrabold text-white">{formatTime(flight.departs_at)}</p>
                    <p className="text-xs font-bold text-sky-400">{flight.origin}</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center max-w-[140px]">
                    <span className="text-[10px] text-slate-500 font-bold">{flight.flight_no}</span>
                    <div className="w-full flex items-center gap-1 my-1">
                      <div className="flex-1 h-px bg-slate-850" />
                      <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                      </svg>
                      <div className="flex-1 h-px bg-slate-850" />
                    </div>
                    <span className="text-[9px] text-slate-500">{formatDuration(flight.departs_at, flight.arrives_at)}</span>
                  </div>

                  <div className="text-left min-w-[60px]">
                    <p className="text-lg font-extrabold text-white">{formatTime(flight.arrives_at)}</p>
                    <p className="text-xs font-bold text-sky-400">{flight.destination}</p>
                  </div>
                </div>

                {/* Date & details */}
                <div className="flex flex-row sm:flex-col items-start sm:items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 sm:min-w-[140px] gap-2.5">
                  <div className="text-left sm:text-center">
                    <p className="text-xs text-slate-400 font-medium">{formatDate(flight.departs_at)}</p>
                    <p className="text-[10px] text-emerald-400/80 font-bold mt-0.5">{seatsAvailableCount} seats left in {userClass}</p>
                  </div>
                </div>

                {/* Reschedule pricing fee & action */}
                <div className="flex items-center justify-between sm:justify-end sm:pl-4 border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0 gap-5">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Change Fee</span>
                    <span className={`text-sm font-extrabold ${priceDiff > 0 ? 'text-white' : 'text-emerald-400'}`}>
                      {priceDiff > 0 ? `+${formatPrice(priceDiff)}` : 'Free Reschedule'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectFlight(flight)}
                    className="rounded-xl bg-sky-600 hover:bg-sky-500 hover:shadow-md hover:shadow-sky-600/10 text-white text-xs font-bold px-4 py-2.5 transition-all active:scale-95 cursor-pointer"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Confirmation Modal */}
      {showConfirmModal && selectedFlight && selectedProcessed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => !isSubmitting && setShowConfirmModal(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Flight Change?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Please review the flight details before confirming. Your seat layout on the new flight will be automatically assigned in the same class (<strong className="text-white capitalize">{userClass}</strong>).
            </p>

            {/* Flight change comparison grid */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 mb-6 flex flex-col gap-4">
              {/* Departure flight */}
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-slate-850 p-2 text-slate-500 mt-0.5 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Leaving Current Flight</span>
                  <span className="text-sm font-bold text-slate-300">{currentFlight.flight_no} · {currentFlight.origin} → {currentFlight.destination}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(currentFlight.departs_at)} at {formatTime(currentFlight.departs_at)}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="w-full h-px bg-slate-900 my-1" />

              {/* New flight */}
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-sky-500/10 p-2 text-sky-400 mt-0.5 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Entering New Flight</span>
                  <span className="text-sm font-bold text-white">{selectedFlight.flight_no} · {selectedFlight.origin} → {selectedFlight.destination}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(selectedFlight.departs_at)} at {formatTime(selectedFlight.departs_at)}</p>
                </div>
              </div>
            </div>

            {/* Fee summary banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 mb-6 flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Difference Charged</span>
              <strong className={`font-black text-base ${selectedProcessed.priceDiff > 0 ? 'text-white' : 'text-emerald-400'}`}>
                {selectedProcessed.priceDiff > 0 ? `+${formatPrice(selectedProcessed.priceDiff)}` : '₹0 (Free)'}
              </strong>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold px-4 py-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReschedule}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 transition-all cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Change...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

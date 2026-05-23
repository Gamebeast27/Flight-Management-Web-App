'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { reserveSeatAction, reserveSeatNoRedirect, type BookingActionState } from '@/app/actions/booking'
import { formatTime, formatDate, formatPrice } from '@/lib/utils/format'
import type { PassengerEntry } from '@/types/store'

interface PassengerFieldState {
  full_name: string
  passport_no: string
  nationality: string
  dob: string
}

const emptyPassenger = (): PassengerFieldState => ({
  full_name: '',
  passport_no: '',
  nationality: '',
  dob: '',
})

export function PassengerForm() {
  const router          = useRouter()
  const selectedFlight  = useFlightStore((s) => s.selectedFlight)
  const selectedSeats   = useFlightStore((s) => s.selectedSeats)
  const setPassengerEntries = useFlightStore((s) => s.setPassengerEntries)
  const resetBooking    = useFlightStore((s) => s.resetBooking)

  // Per-seat passenger fields
  const [passengers, setPassengers] = useState<PassengerFieldState[]>(() =>
    selectedSeats.map(() => emptyPassenger())
  )
  const [errors, setErrors] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const [apiErrors, setApiErrors] = useState<string[]>([])

  // Guard: redirect if nothing selected
  useEffect(() => {
    if (!selectedFlight || selectedSeats.length === 0) {
      router.replace('/')
    }
  }, [selectedFlight, selectedSeats, router])

  if (!selectedFlight || selectedSeats.length === 0) return null

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + selectedFlight.base_price + seat.extra_fee,
    0
  )

  function updatePassenger(idx: number, field: keyof PassengerFieldState, value: string) {
    setPassengers((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx]!, [field]: value }
      return next
    })
  }

  function validate(): boolean {
    const errs: string[] = []
    passengers.forEach((p, i) => {
      const prefix = selectedSeats.length > 1 ? `Passenger ${i + 1} (Seat ${selectedSeats[i]?.seat_number}): ` : ''
      if (!p.full_name.trim()) errs.push(`${prefix}Full name is required.`)
      if (!p.passport_no.trim()) errs.push(`${prefix}Passport number is required.`)
      if (!p.nationality.trim()) errs.push(`${prefix}Nationality is required.`)
      if (!p.dob) errs.push(`${prefix}Date of birth is required.`)
    })
    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsPending(true)
    setApiErrors([])

    // Capture flight here — TS cannot narrow across async boundaries
    const flight = selectedFlight
    if (!flight) { setIsPending(false); return }

    // Single-seat: use the action that handles redirect internally
    if (selectedSeats.length === 1) {
      const seat = selectedSeats[0]!
      const passenger = passengers[0]!

      const fd = new FormData()
      fd.set('seatId', seat.id)
      fd.set('flightId', flight.id)
      fd.set('full_name', passenger.full_name)
      fd.set('passport_no', passenger.passport_no)
      fd.set('nationality', passenger.nationality)
      fd.set('dob', passenger.dob)

      // This action calls redirect() internally on success
      const result: BookingActionState = await reserveSeatAction(null, fd)
      if (result?.error) {
        setApiErrors([result.error])
        setIsPending(false)
      }
      // If no error, the server redirect fires — component unmounts
      return
    }

    // Multi-seat: call no-redirect version for each seat
    const bookingResults: { bookingId: string; pnrCode: string }[] = []
    const newApiErrors: string[] = []

    for (let i = 0; i < selectedSeats.length; i++) {
      const seat = selectedSeats[i]!
      const passenger = passengers[i]!

      const result = await reserveSeatNoRedirect(seat.id, flight.id, {
        full_name:   passenger.full_name,
        passport_no: passenger.passport_no,
        nationality: passenger.nationality,
        dob:         passenger.dob,
      })

      if ('error' in result) {
        newApiErrors.push(`Seat ${seat.seat_number}: ${result.error}`)
      } else {
        bookingResults.push(result)
      }
    }

    if (newApiErrors.length > 0) {
      setApiErrors(newApiErrors)
      setIsPending(false)
      return
    }

    // Save entries to store (passport_no will be stripped from localStorage)
    const entries: PassengerEntry[] = selectedSeats.map((seat, i) => ({
      seatId: seat.id,
      seatNumber: seat.seat_number,
      full_name: passengers[i]?.full_name ?? '',
      nationality: passengers[i]?.nationality ?? '',
      dob: passengers[i]?.dob ?? '',
      passport_no: passengers[i]?.passport_no ?? '',
    }))
    setPassengerEntries(entries)

    // Navigate to confirmation with all booking IDs and PNRs
    const firstResult = bookingResults[0]!
    const allPnrs = bookingResults.map((r) => r.pnrCode).join(',')
    router.push(`/book/confirmation?bookingId=${firstResult.bookingId}&pnr=${allPnrs}`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Passenger forms ─────────────────────────────────────────────── */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex flex-col gap-1">
              {errors.map((e, i) => <span key={i}>• {e}</span>)}
            </div>
          )}

          {/* API errors */}
          {apiErrors.length > 0 && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex flex-col gap-1">
              {apiErrors.map((e, i) => <span key={i}>• {e}</span>)}
            </div>
          )}

          {/* One section per passenger */}
          {selectedSeats.map((seat, idx) => {
            const pax = passengers[idx] ?? emptyPassenger()
            return (
              <div
                key={seat.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-5"
              >
                {/* Seat header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-sm font-black shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Passenger {idx + 1} — Seat <span className="text-sky-400 font-black">{seat.seat_number}</span>
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{seat.class} class · {seat.extra_fee > 0 ? `+${formatPrice(seat.extra_fee)} upgrade` : 'Standard seat'}</p>
                  </div>
                </div>

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`full_name_${idx}`} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id={`full_name_${idx}`}
                    type="text"
                    required
                    autoComplete={idx === 0 ? 'name' : 'off'}
                    value={pax.full_name}
                    onChange={(e) => updatePassenger(idx, 'full_name', e.target.value)}
                    placeholder="As on passport"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Passport number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`passport_no_${idx}`} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Passport number <span className="text-red-400">*</span>
                    <span className="ml-2 text-slate-600 normal-case font-normal">Not saved locally</span>
                  </label>
                  <input
                    id={`passport_no_${idx}`}
                    type="text"
                    required
                    autoComplete="off"
                    value={pax.passport_no}
                    onChange={(e) => updatePassenger(idx, 'passport_no', e.target.value)}
                    placeholder="e.g. A1234567"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Nationality + DOB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`nationality_${idx}`} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Nationality <span className="text-red-400">*</span>
                    </label>
                    <input
                      id={`nationality_${idx}`}
                      type="text"
                      required
                      autoComplete={idx === 0 ? 'country-name' : 'off'}
                      value={pax.nationality}
                      onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                      placeholder="e.g. Indian"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`dob_${idx}`} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date of birth <span className="text-red-400">*</span>
                    </label>
                    <input
                      id={`dob_${idx}`}
                      type="date"
                      required
                      value={pax.dob}
                      onChange={(e) => updatePassenger(idx, 'dob', e.target.value)}
                      max={new Date().toISOString().split('T')[0] ?? ''}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending
              ? `Booking ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}…`
              : `Confirm & Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''} →`}
          </button>
        </form>
      </div>

      {/* ── Booking summary ─────────────────────────────────────────────── */}
      <aside className="lg:w-72 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Booking Summary
          </h2>

          {/* Flight */}
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-700/60">
            <p className="text-xs text-slate-500">Flight</p>
            <p className="text-white font-semibold">{selectedFlight.flight_no}</p>
            <div className="flex items-center gap-1 text-sm text-slate-300">
              <span className="font-bold text-sky-400">{selectedFlight.origin}</span>
              <span>→</span>
              <span className="font-bold text-sky-400">{selectedFlight.destination}</span>
            </div>
            <p className="text-xs text-slate-500">
              {formatDate(selectedFlight.departs_at)} · {formatTime(selectedFlight.departs_at)}
            </p>
          </div>

          {/* Seats summary */}
          <div className="flex flex-col gap-2 py-4 border-b border-slate-700/60">
            <p className="text-xs text-slate-500 mb-1">
              {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}
            </p>
            {selectedSeats.map((seat) => (
              <div key={seat.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">
                  {seat.seat_number}
                  <span className="text-slate-500 font-normal text-xs capitalize ml-1">({seat.class})</span>
                </span>
                <span className="text-slate-400 text-xs">
                  {formatPrice(selectedFlight.base_price + seat.extra_fee)}
                </span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Base fare × {selectedSeats.length}</span>
              <span>{formatPrice(selectedFlight.base_price * selectedSeats.length)}</span>
            </div>
            {selectedSeats.some((s) => s.extra_fee > 0) && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Seat upgrades</span>
                <span>{formatPrice(selectedSeats.reduce((sum, s) => sum + s.extra_fee, 0))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-slate-700/60 mt-1">
              <span>Total</span>
              <span className="text-sky-400">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

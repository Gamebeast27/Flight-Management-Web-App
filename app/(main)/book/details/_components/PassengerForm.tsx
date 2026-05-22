'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { useFlightStore } from '@/store/useFlightStore'
import { reserveSeatAction, type BookingActionState } from '@/app/actions/booking'
import { formatTime, formatDate, formatPrice } from '@/lib/utils/format'

export function PassengerForm() {
  const router        = useRouter()
  const selectedFlight = useFlightStore((s) => s.selectedFlight)
  const selectedSeat   = useFlightStore((s) => s.selectedSeat)
  const passengerData  = useFlightStore((s) => s.passengerFormData)
  const setPassengerData = useFlightStore((s) => s.setPassengerData)

  const [state, formAction, isPending] = useActionState<BookingActionState, FormData>(
    reserveSeatAction,
    null
  )

  // Guard: redirect if no flight or seat selected
  useEffect(() => {
    if (!selectedFlight || !selectedSeat) {
      router.replace('/')
    }
  }, [selectedFlight, selectedSeat, router])

  if (!selectedFlight || !selectedSeat) return null

  const totalPrice = selectedFlight.base_price + selectedSeat.extra_fee

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Passenger form ─────────────────────────────────────────────── */}
      <div className="flex-1">
        <form
          action={(fd) => {
            // Save to store (passport_no excluded from persist by partialize)
            setPassengerData({
              full_name:   fd.get('full_name') as string,
              nationality: fd.get('nationality') as string,
              dob:         fd.get('dob') as string,
              passport_no: fd.get('passport_no') as string,
            })
            formAction(fd)
          }}
          className="flex flex-col gap-5"
          noValidate
        >
          {/* Hidden fields carrying booking context */}
          <input type="hidden" name="seatId"   value={selectedSeat.id} />
          <input type="hidden" name="flightId" value={selectedFlight.id} />

          {/* Error banner */}
          {state?.error && (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <h2 className="text-lg font-bold text-white">Passenger Details</h2>

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              defaultValue={passengerData?.full_name ?? ''}
              placeholder="As on passport"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Passport number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="passport_no" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Passport number <span className="text-red-400">*</span>
              <span className="ml-2 text-slate-600 normal-case font-normal">Not saved locally</span>
            </label>
            <input
              id="passport_no"
              name="passport_no"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. A1234567"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Nationality + DOB in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nationality" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nationality <span className="text-red-400">*</span>
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                required
                autoComplete="country-name"
                defaultValue={passengerData?.nationality ?? ''}
                placeholder="e.g. Indian"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dob" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date of birth <span className="text-red-400">*</span>
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                required
                defaultValue={passengerData?.dob ?? ''}
                max={new Date().toISOString().split('T')[0] ?? ''}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? 'Confirming booking…' : 'Confirm & Book →'}
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

          {/* Seat */}
          <div className="flex flex-col gap-1 py-4 border-b border-slate-700/60">
            <p className="text-xs text-slate-500">Seat</p>
            <p className="text-white font-semibold">{selectedSeat.seat_number}</p>
            <p className="text-xs text-slate-500 capitalize">{selectedSeat.class}</p>
          </div>

          {/* Price breakdown */}
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Base fare</span>
              <span>{formatPrice(selectedFlight.base_price)}</span>
            </div>
            {selectedSeat.extra_fee > 0 && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Seat upgrade</span>
                <span>{formatPrice(selectedSeat.extra_fee)}</span>
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

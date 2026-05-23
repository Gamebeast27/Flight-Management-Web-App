'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/format'
import type { Database } from '@/types/supabase'

type SeatRow = Database['public']['Tables']['seats']['Row']
type SeatClass = SeatRow['class']

const CLASS_CONFIG: Record<SeatClass, { label: string; rows: string; badge: string }> = {
  economy:  { label: 'Economy',    rows: 'Rows 1–20',  badge: 'bg-slate-800 text-slate-300 border border-slate-700/60' },
  business: { label: 'Business',   rows: 'Rows 21–25', badge: 'bg-amber-550/20 text-amber-400 border border-amber-500/30' },
  first:    { label: 'First Class', rows: 'Rows 26–28', badge: 'bg-purple-555/20 text-purple-400 border border-purple-500/30' },
}

interface SeatGridProps {
  seats: SeatRow[]
  selectedClass: SeatClass
  userBookedSeatIds: string[]
  passengerCount: number
}

export function SeatGrid({ seats, selectedClass, userBookedSeatIds, passengerCount }: SeatGridProps) {
  const router      = useRouter()
  const toggleSeat  = useFlightStore((s) => s.toggleSeat)
  const setSeats    = useFlightStore((s) => s.setSeats)
  const selectedSeats = useFlightStore((s) => s.selectedSeats)

  // Maintain local state of seats to support live Realtime updates
  const [localSeats, setLocalSeats] = useState<SeatRow[]>(seats)

  const selectedCount = selectedSeats.length
  const maxSeats = passengerCount

  // Setup Realtime subscription
  useEffect(() => {
    const flightId = seats[0]?.flight_id
    if (!flightId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`flight-seats-${flightId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats',
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updatedSeat = payload.new as SeatRow
          if (!updatedSeat || !updatedSeat.id) return

          setLocalSeats((prev) => {
            const exists = prev.some((s) => s.id === updatedSeat.id)
            if (exists) {
              return prev.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
            } else {
              return [...prev, updatedSeat].sort((a, b) =>
                a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })
              )
            }
          })

          // Collision check: if a selected seat was just taken by someone else, remove it
          const currentSelected = useFlightStore.getState().selectedSeats
          const takenSelected = currentSelected.filter(
            (s) => s.id === updatedSeat.id && !updatedSeat.is_available
          )
          if (takenSelected.length > 0) {
            const remaining = currentSelected.filter((s) => s.id !== updatedSeat.id)
            useFlightStore.getState().setSeats(remaining)
            alert(
              `Notice: Seat ${updatedSeat.seat_number} was just booked by another passenger. It has been deselected.`
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seats])

  // Group local seats by class
  const seatsByClass = localSeats.reduce<Partial<Record<SeatClass, SeatRow[]>>>((acc, seat) => {
    const list = acc[seat.class] ?? []
    list.push(seat)
    acc[seat.class] = list
    return acc
  }, {})

  const classOrder: SeatClass[] = ['first', 'business', 'economy']

  function handleSeatClick(seat: SeatRow) {
    if (!seat.is_available) return
    toggleSeat(seat, maxSeats)
  }

  function handleContinue() {
    if (selectedCount === 0) return
    // Freeze the selection in store then navigate
    setSeats(selectedSeats)
    router.push('/book/details')
  }

  const renderSeatButton = (rowNum: number, col: string, rowSeats: SeatRow[]) => {
    const seat = rowSeats.find((s) => s.seat_number === `${rowNum}${col}`)
    if (!seat) return <div key={col} className="w-10 h-10" />

    const isSelected = selectedSeats.some((s) => s.id === seat.id)
    const isBookedByMe = userBookedSeatIds.includes(seat.id)
    const isAvail = seat.is_available

    let seatStyle = ''
    let stateLabel = ''

    if (isBookedByMe) {
      seatStyle = 'bg-slate-700/50 text-slate-300 border border-slate-600/80 shadow-inner cursor-not-allowed'
      stateLabel = 'your booked seat'
    } else if (isSelected) {
      seatStyle = 'bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-500/30 scale-105 font-black hover:bg-blue-500'
      stateLabel = 'selected'
    } else if (isAvail) {
      seatStyle = 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer font-semibold'
      stateLabel = 'available'
    } else {
      seatStyle = 'bg-rose-500/10 text-rose-500/40 border border-rose-500/15 cursor-not-allowed'
      stateLabel = 'occupied'
    }

    return (
      <div key={col} className="group relative w-full flex justify-center">
        <button
          type="button"
          onClick={() => handleSeatClick(seat)}
          disabled={!isAvail && !isBookedByMe}
          title={seat.seat_number}
          aria-label={`Seat ${seat.seat_number} — ${stateLabel}`}
          className={`h-10 w-full rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center select-none pointer-events-auto ${seatStyle}`}
        >
          {seat.seat_number}
        </button>

        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 z-30 mb-2.5 w-44 -translate-x-1/2 scale-90 rounded-xl border border-slate-800 bg-slate-950/95 p-2.5 text-center text-xs text-slate-300 opacity-0 shadow-2xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 pointer-events-none select-none backdrop-blur-md">
          <p className="font-extrabold text-white">Seat {seat.seat_number}</p>
          <p className="capitalize text-slate-400 mt-0.5">{seat.class} Class</p>
          {!isAvail && !isBookedByMe && <p className="text-rose-500 font-bold mt-1">Occupied</p>}
          {isAvail && isSelected && <p className="text-blue-400 font-bold mt-1">Selected ✓</p>}
          {isAvail && !isSelected && <p className="text-emerald-400 font-bold mt-1">Available</p>}
          {seat.extra_fee > 0 && (
            <p className="text-[10px] text-slate-500 mt-1 font-medium">+{formatPrice(seat.extra_fee)} fee</p>
          )}
          <div className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-[3px] rotate-45 border-r border-b border-slate-800 bg-slate-950" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 justify-center bg-slate-900/40 py-3.5 px-6 rounded-2xl border border-slate-800/60 max-w-xl mx-auto w-full">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/40 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-blue-600 border border-blue-500 inline-block shadow shadow-blue-500/30" />
          Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-700/50 border border-slate-600 inline-block" />
          Your Booking
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-rose-500/10 border border-rose-500/25 inline-block" />
          Occupied
        </span>
      </div>

      {/* Multi-select instruction banner */}
      {maxSeats > 1 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 px-5 py-3.5 text-sm max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Select {maxSeats} seats</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedCount} of {maxSeats} selected — click seats to toggle
              </p>
            </div>
          </div>

          {/* Progress pills */}
          <div className="flex gap-1.5 shrink-0">
            {Array.from({ length: maxSeats }).map((_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                  i < selectedCount
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {i < selectedCount ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Airplane Cabin Layout */}
      <div className="w-full overflow-x-auto select-none pb-8">
        <div className="mx-auto min-w-[540px] max-w-[620px] bg-slate-950/40 rounded-[50px] border-2 border-slate-850/80 p-5 shadow-2xl relative">
          
          {/* Cockpit */}
          <div className="w-full h-24 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-t-[90px] flex flex-col items-center justify-center shadow-lg mb-6 relative overflow-hidden">
            <div className="flex gap-4 mb-2">
              <div className="w-12 h-6 bg-slate-800/70 border border-slate-700/50 rounded-tl-full rounded-br-2xl transform -skew-x-12" />
              <div className="w-12 h-6 bg-slate-800/70 border border-slate-700/50 rounded-tr-full rounded-bl-2xl transform skew-x-12" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Flight Deck</span>
            <div className="absolute bottom-0 w-full h-px bg-slate-800/60" />
          </div>

          {/* Cabin Layout */}
          <div className="flex flex-col gap-10 py-4 px-2 sm:px-6 relative">
            {classOrder.map((cls) => {
              const clsSeats = seatsByClass[cls]
              if (!clsSeats || clsSeats.length === 0) return null

              const config = CLASS_CONFIG[cls]
              const rows = clsSeats.reduce<Record<number, SeatRow[]>>((acc, seat) => {
                const rowNum = parseInt(seat.seat_number, 10)
                const list = acc[rowNum] ?? []
                list.push(seat)
                acc[rowNum] = list
                return acc
              }, {})

              const isHighlighted = cls === selectedClass

              return (
                <div
                  key={cls}
                  className={[
                    'rounded-3xl border transition-all duration-300 relative',
                    isHighlighted
                      ? 'border-sky-500/40 bg-slate-900/40 shadow-lg shadow-sky-500/5'
                      : 'border-slate-800/60 bg-slate-950/20 opacity-80',
                  ].join(' ')}
                >
                  <div className="absolute -top-3 left-6">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="p-5 pt-7">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                      <span className="text-xs text-slate-500 font-medium">{config.rows}</span>
                      {isHighlighted && (
                        <span className="text-xs text-sky-400 font-extrabold tracking-wide flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                          Highlighted Class
                        </span>
                      )}
                    </div>

                    {cls === 'first' && (
                      <>
                        <div
                          className="grid gap-1.5 mb-2 items-center text-center text-xs font-bold text-slate-500"
                          style={{ gridTemplateColumns: `2.5rem 1fr 1.5rem 1fr` }}
                        >
                          <div /><div>A</div><div /><div>B</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(rows)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([rowNum, rowSeats]) => (
                              <div
                                key={rowNum}
                                className="grid gap-1.5 items-center justify-items-center"
                                style={{ gridTemplateColumns: `2.5rem 1fr 1.5rem 1fr` }}
                              >
                                <span className="text-xs font-semibold text-slate-600 pr-2">{rowNum}</span>
                                {renderSeatButton(Number(rowNum), 'A', rowSeats)}
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-800 font-bold select-none opacity-40">|</div>
                                {renderSeatButton(Number(rowNum), 'B', rowSeats)}
                              </div>
                            ))}
                        </div>
                      </>
                    )}

                    {cls === 'business' && (
                      <>
                        <div
                          className="grid gap-1.5 mb-2 items-center text-center text-xs font-bold text-slate-500"
                          style={{ gridTemplateColumns: `2.5rem 1fr 1fr 1.5rem 1fr 1fr` }}
                        >
                          <div /><div>A</div><div>B</div><div /><div>C</div><div>D</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(rows)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([rowNum, rowSeats]) => (
                              <div
                                key={rowNum}
                                className="grid gap-1.5 items-center justify-items-center"
                                style={{ gridTemplateColumns: `2.5rem 1fr 1fr 1.5rem 1fr 1fr` }}
                              >
                                <span className="text-xs font-semibold text-slate-600 pr-2">{rowNum}</span>
                                {renderSeatButton(Number(rowNum), 'A', rowSeats)}
                                {renderSeatButton(Number(rowNum), 'B', rowSeats)}
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-800 font-bold select-none opacity-40">|</div>
                                {renderSeatButton(Number(rowNum), 'C', rowSeats)}
                                {renderSeatButton(Number(rowNum), 'D', rowSeats)}
                              </div>
                            ))}
                        </div>
                      </>
                    )}

                    {cls === 'economy' && (
                      <>
                        <div
                          className="grid gap-1.5 mb-2 items-center text-center text-xs font-bold text-slate-500"
                          style={{ gridTemplateColumns: `2.5rem 1fr 1fr 1fr 1.5rem 1fr 1fr 1fr` }}
                        >
                          <div /><div>A</div><div>B</div><div>C</div><div /><div>D</div><div>E</div><div>F</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {Object.entries(rows)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([rowNum, rowSeats]) => {
                              const num = Number(rowNum)
                              return (
                                <div key={rowNum} className="flex flex-col w-full gap-2">
                                  {(num === 11 || num === 20) && (
                                    <div className="my-1 py-1 flex items-center gap-1.5 w-full bg-amber-500/10 border-y border-amber-500/20 rounded-lg text-[9px] font-bold text-amber-500/80 uppercase tracking-wider justify-center select-none">
                                      <span>🚪 EMERGENCY EXIT ROW — EXTRA LEGROOM</span>
                                    </div>
                                  )}
                                  <div
                                    className="grid gap-1.5 items-center justify-items-center"
                                    style={{ gridTemplateColumns: `2.5rem 1fr 1fr 1fr 1.5rem 1fr 1fr 1fr` }}
                                  >
                                    <span className="text-xs font-semibold text-slate-600 pr-2">{rowNum}</span>
                                    {renderSeatButton(num, 'A', rowSeats)}
                                    {renderSeatButton(num, 'B', rowSeats)}
                                    {renderSeatButton(num, 'C', rowSeats)}
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-800 font-bold select-none opacity-40">|</div>
                                    {renderSeatButton(num, 'D', rowSeats)}
                                    {renderSeatButton(num, 'E', rowSeats)}
                                    {renderSeatButton(num, 'F', rowSeats)}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tail */}
          <div className="w-full h-12 bg-gradient-to-t from-slate-900 to-slate-950 border border-slate-800/80 rounded-b-[40px] flex items-center justify-center shadow-inner mt-6">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Galley &amp; Tail Section</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Continue Bar */}
      <div className={`sticky bottom-4 z-40 mx-auto w-full max-w-xl transition-all duration-300 ${selectedCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-slate-950/60 flex items-center justify-between gap-4">
          {/* Selected seat pills */}
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {selectedSeats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 px-3 py-1.5 text-xs font-bold text-blue-300"
              >
                <span>{seat.seat_number}</span>
                <button
                  type="button"
                  onClick={() => toggleSeat(seat, maxSeats)}
                  className="w-3.5 h-3.5 rounded-full bg-blue-500/30 hover:bg-blue-500/60 flex items-center justify-center text-blue-200 transition-colors cursor-pointer leading-none"
                  aria-label={`Remove seat ${seat.seat_number}`}
                >
                  ×
                </button>
              </div>
            ))}
            {selectedCount < maxSeats && (
              <div className="flex items-center gap-1 rounded-lg border border-dashed border-slate-700 px-3 py-1.5 text-xs text-slate-500">
                +{maxSeats - selectedCount} more
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedCount !== maxSeats}
            className="shrink-0 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-3 transition-all shadow-lg shadow-sky-500/20 disabled:shadow-none active:scale-95"
          >
            {selectedCount === maxSeats
              ? `Continue →`
              : `Select ${maxSeats - selectedCount} more`}
          </button>
        </div>
      </div>
    </div>
  )
}

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
}

export function SeatGrid({ seats, selectedClass, userBookedSeatIds }: SeatGridProps) {
  const router  = useRouter()
  const setSeat = useFlightStore((s) => s.setSeat)
  const selectedSeat = useFlightStore((s) => s.selectedSeat)

  // Maintain local state of seats to support live Realtime updates
  const [localSeats, setLocalSeats] = useState<SeatRow[]>(seats)



  // Setup Realtime subscription
  useEffect(() => {
    const flightId = seats[0]?.flight_id
    if (!flightId) return

    const supabase = createClient()

    // Subscribe to changes on seats table for the current flight
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

          // Collision checking:
          // If the seat just booked/updated is our currently selected seat, and is no longer available
          const currentSelected = useFlightStore.getState().selectedSeat
          if (
            currentSelected &&
            currentSelected.id === updatedSeat.id &&
            !updatedSeat.is_available
          ) {
            // Deselect seat
            setSeat(null)
            // Notify user
            alert(
              `Notice: Seat ${updatedSeat.seat_number} was just booked by another passenger. Please select a different seat.`
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [seats, setSeat])

  // Group local seats by class
  const seatsByClass = localSeats.reduce<Partial<Record<SeatClass, SeatRow[]>>>((acc, seat) => {
    const list = acc[seat.class] ?? []
    list.push(seat)
    acc[seat.class] = list
    return acc
  }, {})

  const classOrder: SeatClass[] = ['first', 'business', 'economy']

  function handleSelect(seat: SeatRow) {
    if (!seat.is_available) return
    setSeat(seat)
    router.push('/book/details')
  }

  const renderSeatButton = (rowNum: number, col: string, rowSeats: SeatRow[]) => {
    const seat = rowSeats.find((s) => s.seat_number === `${rowNum}${col}`)
    if (!seat) return <div key={col} className="w-10 h-10" />

    const isSelected = selectedSeat?.id === seat.id
    const isBookedByMe = userBookedSeatIds.includes(seat.id)
    const isAvail = seat.is_available

    let seatStyle = ''
    let stateLabel = ''

    if (isBookedByMe) {
      // Gray (Booked by current user)
      seatStyle = 'bg-slate-700/50 text-slate-300 border border-slate-600/80 shadow-inner cursor-not-allowed'
      stateLabel = 'your booked seat'
    } else if (isSelected) {
      // Blue (Selected by user)
      seatStyle = 'bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-500/30 scale-105 font-black hover:bg-blue-500'
      stateLabel = 'selected'
    } else if (isAvail) {
      // Green (Available)
      seatStyle = 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer font-semibold'
      stateLabel = 'available'
    } else {
      // Red (Occupied)
      seatStyle = 'bg-rose-500/10 text-rose-500/40 border border-rose-500/15 cursor-not-allowed'
      stateLabel = 'occupied'
    }

    return (
      <div key={col} className="group relative w-full flex justify-center">
        <button
          type="button"
          onClick={() => handleSelect(seat)}
          disabled={!isAvail && !isBookedByMe}
          title={seat.seat_number}
          aria-label={`Seat ${seat.seat_number} — ${stateLabel}`}
          className={`h-10 w-full rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center select-none pointer-events-auto ${seatStyle}`}
        >
          {seat.seat_number}
        </button>

        {/* Hover Tooltip for Occupied Seats */}
        {!isAvail && !isBookedByMe && (
          <div className="absolute bottom-full left-1/2 z-30 mb-2.5 w-44 -translate-x-1/2 scale-90 rounded-xl border border-slate-800 bg-slate-950/95 p-2.5 text-center text-xs text-slate-300 opacity-0 shadow-2xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 pointer-events-none select-none backdrop-blur-md">
            <p className="font-extrabold text-white">Seat {seat.seat_number}</p>
            <p className="capitalize text-slate-400 mt-0.5">{seat.class} Class</p>
            <p className="text-rose-500 font-bold mt-1">Occupied</p>
            {seat.extra_fee > 0 && (
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Upgrade: +{formatPrice(seat.extra_fee)}</p>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-[3px] rotate-45 border-r border-b border-slate-800 bg-slate-950" />
          </div>
        )}
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

      {/* Airplane Cabin Layout Scroll Wrapper */}
      <div className="w-full overflow-x-auto select-none pb-8 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
        {/* Airplane Fuselage Container */}
        <div className="mx-auto min-w-[540px] max-w-[620px] bg-slate-950/40 rounded-[50px] border-2 border-slate-850/80 p-5 shadow-2xl relative">
          
          {/* Airplane Cockpit / Nose */}
          <div className="w-full h-24 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-t-[90px] flex flex-col items-center justify-center shadow-lg mb-6 relative overflow-hidden">
            {/* Cockpit Windows */}
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

              // Group seats by row number
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
                  {/* Floating Cabin Label */}
                  <div className="absolute -top-3 left-6">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>

                  <div className="p-5 pt-7">
                    {/* Class header description */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                      <span className="text-xs text-slate-500 font-medium">{config.rows}</span>
                      {isHighlighted && (
                        <span className="text-xs text-sky-400 font-extrabold tracking-wide flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                          Highlighted Class
                        </span>
                      )}
                    </div>

                    {/* Column labels and rows based on Class */}
                    {cls === 'first' && (
                      <>
                        <div
                          className="grid gap-1.5 mb-2 items-center text-center text-xs font-bold text-slate-500"
                          style={{ gridTemplateColumns: `2.5rem 1fr 1.5rem 1fr` }}
                        >
                          <div />
                          <div>A</div>
                          <div />
                          <div>B</div>
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
                          <div />
                          <div>A</div>
                          <div>B</div>
                          <div />
                          <div>C</div>
                          <div>D</div>
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
                          <div />
                          <div>A</div>
                          <div>B</div>
                          <div>C</div>
                          <div />
                          <div>D</div>
                          <div>E</div>
                          <div>F</div>
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

          {/* Airplane Tail */}
          <div className="w-full h-12 bg-gradient-to-t from-slate-900 to-slate-950 border border-slate-800/80 rounded-b-[40px] flex items-center justify-center shadow-inner mt-6">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Galley & Tail Section</span>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'
import type { Database } from '@/types/supabase'

type SeatRow = Database['public']['Tables']['seats']['Row']

type SeatClass = SeatRow['class']

const CLASS_CONFIG: Record<SeatClass, { label: string; rows: string; badge: string }> = {
  economy:  { label: 'Economy',    rows: 'Rows 1–20',  badge: 'bg-slate-700 text-slate-300' },
  business: { label: 'Business',   rows: 'Rows 21–25', badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  first:    { label: 'First Class', rows: 'Rows 26–28', badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
}

const SEAT_COLS: Record<SeatClass, string[]> = {
  economy:  ['A','B','C','D','E','F'],
  business: ['A','B','C','D'],
  first:    ['A','B'],
}

interface SeatGridProps {
  seats: SeatRow[]
  selectedClass: SeatClass
}

export function SeatGrid({ seats, selectedClass }: SeatGridProps) {
  const router  = useRouter()
  const setSeat = useFlightStore((s) => s.setSeat)

  const selectedSeat = useFlightStore((s) => s.selectedSeat)

  // Group seats by class
  const seatsByClass = seats.reduce<Partial<Record<SeatClass, SeatRow[]>>>((acc, seat) => {
    const list = acc[seat.class] ?? []
    list.push(seat)
    acc[seat.class] = list
    return acc
  }, {})

  // Render order
  const classOrder: SeatClass[] = ['first', 'business', 'economy']

  function handleSelect(seat: SeatRow) {
    if (!seat.is_available) return
    setSeat(seat)
    router.push('/book/details')
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-400 justify-center">
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sky-500/20 border border-sky-500/60 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-slate-800 border border-slate-700 inline-block" /> Taken</span>
      </div>

      {classOrder.map((cls) => {
        const clsSeats = seatsByClass[cls]
        if (!clsSeats || clsSeats.length === 0) return null

        const config = CLASS_CONFIG[cls]
        const cols   = SEAT_COLS[cls]

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
              'rounded-2xl border p-5 transition-all',
              isHighlighted
                ? 'border-sky-500/40 bg-slate-900/60'
                : 'border-slate-700/40 bg-slate-900/30 opacity-80',
            ].join(' ')}
          >
            {/* Class header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${config.badge}`}>
                  {config.label}
                </span>
                <span className="ml-2 text-xs text-slate-500">{config.rows}</span>
              </div>
              {isHighlighted && (
                <span className="text-xs text-sky-400 font-medium">Your class</span>
              )}
            </div>

            {/* Column labels */}
            <div
              className="grid gap-1.5 mb-1"
              style={{ gridTemplateColumns: `2.5rem repeat(${cols.length}, 1fr)` }}
            >
              <div />
              {cols.map((col) => (
                <div key={col} className="text-center text-xs font-bold text-slate-500">{col}</div>
              ))}
            </div>

            {/* Seat rows */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {Object.entries(rows)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([rowNum, rowSeats]) => (
                  <div
                    key={rowNum}
                    className="grid gap-1.5 items-center"
                    style={{ gridTemplateColumns: `2.5rem repeat(${cols.length}, 1fr)` }}
                  >
                    <span className="text-xs text-slate-600 text-right pr-1">{rowNum}</span>
                    {cols.map((col) => {
                      const seat = rowSeats.find((s) => s.seat_number === `${rowNum}${col}`)
                      if (!seat) return <div key={col} />

                      const isSelected = selectedSeat?.id === seat.id
                      const isAvail    = seat.is_available

                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSelect(seat)}
                          disabled={!isAvail}
                          title={seat.seat_number}
                          aria-label={`Seat ${seat.seat_number} — ${isAvail ? 'available' : 'taken'}`}
                          className={[
                            'h-7 w-full rounded text-xs font-bold transition-all duration-150',
                            isSelected
                              ? 'bg-sky-500 text-white scale-110 shadow-md shadow-sky-500/30'
                              : isAvail
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/40 hover:scale-105 cursor-pointer'
                              : 'bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed',
                          ].join(' ')}
                        >
                          {seat.seat_number}
                        </button>
                      )
                    })}
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

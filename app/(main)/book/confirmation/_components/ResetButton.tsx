'use client'

import { useRouter } from 'next/navigation'
import { useFlightStore } from '@/store/useFlightStore'

export function ResetButton() {
  const router       = useRouter()
  const resetBooking = useFlightStore((s) => s.resetBooking)

  function handleDone() {
    resetBooking()
    router.push('/')
  }

  return (
    <button
      onClick={handleDone}
      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 active:translate-y-0"
    >
      Book Another Flight →
    </button>
  )
}

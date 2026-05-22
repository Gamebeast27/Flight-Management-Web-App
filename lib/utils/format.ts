const IST_OPTIONS: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata' }

/** Format a UTC ISO string as HH:MM in IST e.g. "06:00 AM" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    ...IST_OPTIONS,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Format a UTC ISO string as "15 Jun 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    ...IST_OPTIONS,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format a UTC ISO string as "Sun, 15 Jun" */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    ...IST_OPTIONS,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** Calculate flight duration as "Xh Ym" */
export function formatDuration(departsAt: string, arrivesAt: string): string {
  const ms = new Date(arrivesAt).getTime() - new Date(departsAt).getTime()
  const hours   = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

/** Format a number as Indian Rupees e.g. "₹4,500" */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Return today's date as an ISO date string "YYYY-MM-DD" for date input min */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

import type { Database } from '@/types/supabase'

type FlightRow  = Database['public']['Tables']['flights']['Row']
type SeatRow    = Database['public']['Tables']['seats']['Row']
type BookingRow = Database['public']['Tables']['bookings']['Row']

/** Booking record joined with its flight and seat — used on the confirmation page */
export interface BookingWithDetails extends BookingRow {
  flights: FlightRow
  seats: SeatRow
}

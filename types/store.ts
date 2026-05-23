/**
 * Shared TypeScript types for Zustand stores.
 * No `any` — all shapes are explicit.
 */

import type { Session } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// ─── Row aliases ─────────────────────────────────────────────────────────────
export type FlightRow   = Database['public']['Tables']['flights']['Row']
export type SeatRow     = Database['public']['Tables']['seats']['Row']
export type BookingRow  = Database['public']['Tables']['bookings']['Row']

// ─── Booking step ─────────────────────────────────────────────────────────────
export type BookingStep =
  | 'search'
  | 'select-flight'
  | 'select-seat'
  | 'passenger-details'
  | 'confirm'
  | 'complete'

// ─── Flight search query ──────────────────────────────────────────────────────
export interface FlightSearchQuery {
  origin: string
  destination: string
  /** ISO date string e.g. '2026-06-15' */
  date: string
  /** 'economy' | 'business' | 'first' */
  cabinClass: SeatRow['class']
  passengerCount: number
}

// ─── Passenger form data ──────────────────────────────────────────────────────
/** passport_no is intentionally excluded from the persisted store */
export interface PassengerFormData {
  full_name: string
  nationality: string
  /** ISO date string e.g. '1990-01-01' */
  dob: string
  /**
   * passport_no is collected in the form but is NEVER persisted to localStorage.
   * It lives in memory only (runtime state). The store's `partialize` excludes it.
   */
  passport_no: string
}

// ─── Flight store shape ───────────────────────────────────────────────────────
export interface FlightStoreState {
  activeSearchQuery: FlightSearchQuery | null
  selectedFlight: FlightRow | null
  selectedSeat: SeatRow | null
  currentBookingStep: BookingStep
  passengerFormData: PassengerFormData | null
}

export interface FlightStoreActions {
  setSearch: (query: FlightSearchQuery) => void
  setFlight: (flight: FlightRow | null) => void
  setSeat: (seat: SeatRow | null) => void
  setStep: (step: BookingStep) => void
  setPassengerData: (data: PassengerFormData) => void
  resetBooking: () => void
}

export type FlightStore = FlightStoreState & FlightStoreActions

/** Shape written to localStorage — passport_no excluded */
export type PersistedFlightState = Omit<FlightStoreState, 'passengerFormData'> & {
  passengerFormData: Omit<PassengerFormData, 'passport_no'> | null
}

// ─── User store shape ─────────────────────────────────────────────────────────
export interface UserStoreState {
  session: Session | null
  cachedBookings: BookingRow[]
}

export interface UserStoreActions {
  setSession: (session: Session | null) => void
  setCachedBookings: (bookings: BookingRow[]) => void
  clearCachedBookings: () => void
  clearUser: () => void
}

export type UserStore = UserStoreState & UserStoreActions

/** Only the session token string is persisted, not the full object */
export interface PersistedUserState {
  session: Session | null
}

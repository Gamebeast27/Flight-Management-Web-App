/**
 * Shared TypeScript types for Zustand stores.
 * No `any` — all shapes are explicit.
 */

import type { Session } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { BookingWithFullDetails } from './booking'

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

// ─── Passenger form data per seat ────────────────────────────────────────────
/** Per-seat passenger data collected on the details page */
export interface PassengerEntry {
  seatId: string
  seatNumber: string
  full_name: string
  nationality: string
  dob: string
  passport_no: string
}

// ─── Flight store shape ───────────────────────────────────────────────────────
export interface FlightStoreState {
  activeSearchQuery: FlightSearchQuery | null
  selectedFlight: FlightRow | null
  /** Legacy single-seat compat — always first of selectedSeats or null */
  selectedSeat: SeatRow | null
  /** All seats the user has toggled on the cabin map (multi-passenger) */
  selectedSeats: SeatRow[]
  currentBookingStep: BookingStep
  passengerFormData: PassengerFormData | null
  /** Per-passenger data indexed by seatId */
  passengerEntries: PassengerEntry[]
}

export interface FlightStoreActions {
  setSearch: (query: FlightSearchQuery) => void
  setFlight: (flight: FlightRow | null) => void
  /** Legacy single-seat compat */
  setSeat: (seat: SeatRow | null) => void
  /** Toggle a seat in/out of selectedSeats, respecting passengerCount limit */
  toggleSeat: (seat: SeatRow, maxSeats: number) => void
  /** Replace the full selection */
  setSeats: (seats: SeatRow[]) => void
  setStep: (step: BookingStep) => void
  setPassengerData: (data: PassengerFormData) => void
  setPassengerEntries: (entries: PassengerEntry[]) => void
  resetBooking: () => void
}

export type FlightStore = FlightStoreState & FlightStoreActions

/** Shape written to localStorage — passport_no excluded from each entry */
export type PersistedFlightState = Omit<
  FlightStoreState,
  'passengerFormData' | 'passengerEntries'
> & {
  passengerFormData: Omit<PassengerFormData, 'passport_no'> | null
  passengerEntries: Omit<PassengerEntry, 'passport_no'>[]
}

// ─── User store shape ─────────────────────────────────────────────────────────
export interface UserStoreState {
  session: Session | null
  cachedBookings: BookingWithFullDetails[]
}

export interface UserStoreActions {
  setSession: (session: Session | null) => void
  setCachedBookings: (bookings: BookingWithFullDetails[]) => void
  clearCachedBookings: () => void
  clearUser: () => void
}

export type UserStore = UserStoreState & UserStoreActions

/** Cache user session and user's booked tickets offline */
export interface PersistedUserState {
  session: Session | null
  cachedBookings: BookingWithFullDetails[]
}

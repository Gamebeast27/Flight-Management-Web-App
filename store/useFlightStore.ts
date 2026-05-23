'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  FlightStore,
  FlightStoreState,
  PersistedFlightState,
  FlightSearchQuery,
  FlightRow,
  SeatRow,
  BookingStep,
  PassengerFormData,
  PassengerEntry,
} from '@/types/store'

// ─── Initial state ────────────────────────────────────────────────────────────
const initialFlightState: FlightStoreState = {
  activeSearchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  selectedSeats: [],
  currentBookingStep: 'search',
  passengerFormData: null,
  passengerEntries: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFlightStore = create<FlightStore>()(
  persist(
    (set, get) => ({
      ...initialFlightState,

      setSearch: (query: FlightSearchQuery) =>
        set({ activeSearchQuery: query, currentBookingStep: 'select-flight' }),

      setFlight: (flight: FlightRow | null) =>
        set({
          selectedFlight: flight,
          selectedSeats: [],
          selectedSeat: null,
          currentBookingStep: flight ? 'select-seat' : 'select-flight',
        }),

      /** Legacy compat: set single seat (clears multi-select) */
      setSeat: (seat: SeatRow | null) =>
        set({
          selectedSeat: seat,
          selectedSeats: seat ? [seat] : [],
          currentBookingStep: seat ? 'passenger-details' : 'select-seat',
        }),

      /** Toggle a seat in multi-select mode */
      toggleSeat: (seat: SeatRow, maxSeats: number) => {
        const current = get().selectedSeats
        const exists = current.some((s) => s.id === seat.id)

        let next: SeatRow[]
        if (exists) {
          // Deselect
          next = current.filter((s) => s.id !== seat.id)
        } else if (current.length < maxSeats) {
          // Add if under limit
          next = [...current, seat]
        } else {
          // At limit — replace oldest with new
          next = [...current.slice(1), seat]
        }

        set({
          selectedSeats: next,
          selectedSeat: next[0] ?? null,
          currentBookingStep: next.length > 0 ? 'select-seat' : 'select-seat',
        })
      },

      /** Replace entire selection */
      setSeats: (seats: SeatRow[]) =>
        set({
          selectedSeats: seats,
          selectedSeat: seats[0] ?? null,
          currentBookingStep: seats.length > 0 ? 'passenger-details' : 'select-seat',
        }),

      setStep: (step: BookingStep) => set({ currentBookingStep: step }),

      setPassengerData: (data: PassengerFormData) => set({ passengerFormData: data }),

      setPassengerEntries: (entries: PassengerEntry[]) => set({ passengerEntries: entries }),

      resetBooking: () => set(initialFlightState),
    }),
    {
      name: 'flight-store',
      storage: createJSONStorage(() => localStorage),

      /**
       * SECURITY: passport_no is NEVER written to localStorage.
       * It lives in memory only and is cleared on resetBooking / page refresh.
       */
      partialize: (state): PersistedFlightState => ({
        activeSearchQuery: state.activeSearchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        selectedSeats: state.selectedSeats,
        currentBookingStep: state.currentBookingStep,
        // Strip passport_no from persisted passenger data
        passengerFormData: state.passengerFormData
          ? {
              full_name: state.passengerFormData.full_name,
              nationality: state.passengerFormData.nationality,
              dob: state.passengerFormData.dob,
            }
          : null,
        // Strip passport_no from each passenger entry
        passengerEntries: state.passengerEntries.map((e) => ({
          seatId: e.seatId,
          seatNumber: e.seatNumber,
          full_name: e.full_name,
          nationality: e.nationality,
          dob: e.dob,
        })),
      }),
    }
  )
)

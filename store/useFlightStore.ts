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
} from '@/types/store'

// ─── Initial state ────────────────────────────────────────────────────────────
const initialFlightState: FlightStoreState = {
  activeSearchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  currentBookingStep: 'search',
  passengerFormData: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialFlightState,

      setSearch: (query: FlightSearchQuery) =>
        set({ activeSearchQuery: query, currentBookingStep: 'select-flight' }),

      setFlight: (flight: FlightRow | null) =>
        set({ selectedFlight: flight, currentBookingStep: flight ? 'select-seat' : 'select-flight' }),

      setSeat: (seat: SeatRow | null) =>
        set({ selectedSeat: seat, currentBookingStep: seat ? 'passenger-details' : 'select-seat' }),

      setStep: (step: BookingStep) => set({ currentBookingStep: step }),

      setPassengerData: (data: PassengerFormData) => set({ passengerFormData: data }),

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
        currentBookingStep: state.currentBookingStep,
        // Strip passport_no from persisted passenger data
        passengerFormData: state.passengerFormData
          ? {
              full_name: state.passengerFormData.full_name,
              nationality: state.passengerFormData.nationality,
              dob: state.passengerFormData.dob,
            }
          : null,
      }),
    }
  )
)

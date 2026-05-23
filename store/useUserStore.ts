'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  UserStore,
  UserStoreState,
  PersistedUserState,
} from '@/types/store'
import type { BookingWithFullDetails } from '@/types/booking'
import type { Session } from '@supabase/supabase-js'

// ─── Initial state ────────────────────────────────────────────────────────────
const initialUserState: UserStoreState = {
  session: null,
  cachedBookings: [],
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialUserState,

      setSession: (session: Session | null) => set({ session }),

      setCachedBookings: (bookings: BookingWithFullDetails[]) =>
        set({ cachedBookings: bookings }),

      clearCachedBookings: () => set({ cachedBookings: [] }),

      clearUser: () => set(initialUserState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),

      /**
       * Persist session and cachedBookings for offline support.
       */
      partialize: (state): PersistedUserState => ({
        session: state.session,
        cachedBookings: state.cachedBookings,
      }),
    }
  )
)

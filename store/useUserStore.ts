'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  UserStore,
  UserStoreState,
  PersistedUserState,
  BookingRow,
} from '@/types/store'
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

      setCachedBookings: (bookings: BookingRow[]) =>
        set({ cachedBookings: bookings }),

      clearUser: () => set(initialUserState),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),

      /**
       * Only persist the session token — cachedBookings are fetched fresh
       * from Supabase on each visit to avoid stale data.
       */
      partialize: (state): PersistedUserState => ({
        session: state.session,
      }),
    }
  )
)

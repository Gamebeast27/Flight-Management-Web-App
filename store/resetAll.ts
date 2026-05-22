'use client'

import { useFlightStore } from '@/store/useFlightStore'
import { useUserStore } from '@/store/useUserStore'

/**
 * Resets ALL store state across both stores.
 *
 * Call this on:
 *  - User logout
 *  - Booking cancellation (to clear in-progress booking data)
 *
 * This also clears the persisted localStorage entries so a future
 * page load starts fresh.
 */
export function resetAll(): void {
  useFlightStore.getState().resetBooking()
  useUserStore.getState().clearUser()
}

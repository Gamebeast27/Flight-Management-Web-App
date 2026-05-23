'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResponse = {
  success: boolean
  error?: string
}

/**
 * Server action to cancel a booking.
 * Invokes the atomic cancel_booking Supabase RPC.
 */
export async function cancelBookingAction(bookingId: string): Promise<ActionResponse> {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to cancel a booking.' }
  }

  // 2. Call the cancel_booking RPC
  const { error: rpcError } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
  })

  if (rpcError) {
    console.error('cancelBookingAction failed:', rpcError)
    // Extract user-friendly error raised by the database check_cancellation_window trigger
    if (rpcError.message.includes('Cancellation not allowed')) {
      return { success: false, error: rpcError.message }
    }
    return { success: false, error: rpcError.message || 'Failed to cancel booking.' }
  }

  // 3. Clear server cache for bookings list
  revalidatePath('/bookings')
  return { success: true }
}

/**
 * Server action to reschedule a booking to a different flight.
 * Invokes the atomic reschedule_booking Supabase RPC.
 */
export async function rescheduleBookingAction(
  bookingId: string,
  newFlightId: string
): Promise<ActionResponse> {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to reschedule.' }
  }

  // 2. Call the reschedule_booking RPC
  const { error: rpcError } = await supabase.rpc('reschedule_booking', {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
  })

  if (rpcError) {
    console.error('rescheduleBookingAction failed:', rpcError)
    if (rpcError.message.includes('Reschedule not allowed')) {
      return { success: false, error: rpcError.message }
    }
    if (rpcError.message.includes('no available seats')) {
      return { success: false, error: rpcError.message }
    }
    return { success: false, error: rpcError.message || 'Failed to reschedule flight.' }
  }

  // 3. Clear server cache for bookings list
  revalidatePath('/bookings')
  return { success: true }
}

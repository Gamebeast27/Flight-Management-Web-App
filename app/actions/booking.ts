'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type BookingActionState = { error: string } | null

/** Single seat reservation. Redirects to confirmation on success. */
export async function reserveSeatAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const seatId      = formData.get('seatId')
  const flightId    = formData.get('flightId')
  const fullName    = formData.get('full_name')
  const passportNo  = formData.get('passport_no')
  const nationality = formData.get('nationality')
  const dob         = formData.get('dob')

  // ── Input validation ──────────────────────────────────────────────────────
  if (
    typeof seatId     !== 'string' || !seatId     ||
    typeof flightId   !== 'string' || !flightId   ||
    typeof fullName   !== 'string' || !fullName.trim() ||
    typeof passportNo !== 'string' || !passportNo.trim() ||
    typeof nationality !== 'string' || !nationality.trim() ||
    typeof dob        !== 'string' || !dob
  ) {
    return { error: 'All passenger fields are required.' }
  }

  const supabase = await createClient()

  // ── Auth check ────────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be signed in to complete a booking.' }
  }

  // ── Atomic seat reservation (SELECT FOR UPDATE inside RPC) ────────────────
  const { data: rpcData, error: rpcError } = await supabase.rpc('reserve_seat', {
    p_seat_id:   seatId,
    p_user_id:   user.id,
    p_flight_id: flightId,
  })

  if (rpcError) {
    if (rpcError.message.includes('no longer available')) {
      return { error: 'Sorry — this seat was just taken. Please go back and pick another.' }
    }
    if (rpcError.message.includes('not bookable')) {
      return { error: 'This flight is no longer accepting bookings.' }
    }
    if (rpcError.message.includes('unauthorized')) {
      return { error: 'Session error. Please sign out and sign back in.' }
    }
    return { error: rpcError.message }
  }

  const booking = rpcData?.[0]
  if (!booking) {
    return { error: 'Booking failed — no confirmation received. Please try again.' }
  }

  // ── Insert passenger record ───────────────────────────────────────────────
  const { error: passengerError } = await supabase.from('passengers').insert({
    booking_id:  booking.booking_id,
    full_name:   fullName.trim(),
    passport_no: passportNo.trim().toUpperCase(),
    nationality: nationality.trim(),
    dob,
  })

  if (passengerError) {
    console.error('Passenger insert error:', passengerError.message)
  }

  redirect(
    `/book/confirmation?bookingId=${booking.booking_id}&pnr=${booking.pnr_code}`
  )
}

/** Multi-seat version: reserves a single seat and returns result WITHOUT redirecting.
 *  Used when booking multiple seats for multiple passengers. */
export async function reserveSeatNoRedirect(
  seatId: string,
  flightId: string,
  passenger: {
    full_name: string
    passport_no: string
    nationality: string
    dob: string
  }
): Promise<{ error: string } | { bookingId: string; pnrCode: string }> {
  const supabase = await createClient()

  // ── Auth check ────────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be signed in to complete a booking.' }
  }

  // ── Atomic seat reservation ────────────────────────────────────────────────
  const { data: rpcData, error: rpcError } = await supabase.rpc('reserve_seat', {
    p_seat_id:   seatId,
    p_user_id:   user.id,
    p_flight_id: flightId,
  })

  if (rpcError) {
    if (rpcError.message.includes('no longer available')) {
      return { error: 'This seat was just taken by another passenger.' }
    }
    if (rpcError.message.includes('not bookable')) {
      return { error: 'This flight is no longer accepting bookings.' }
    }
    if (rpcError.message.includes('unauthorized')) {
      return { error: 'Session error. Please sign out and sign back in.' }
    }
    return { error: rpcError.message }
  }

  const booking = rpcData?.[0]
  if (!booking) {
    return { error: 'Booking failed — no confirmation received. Please try again.' }
  }

  // ── Insert passenger record ───────────────────────────────────────────────
  const { error: passengerError } = await supabase.from('passengers').insert({
    booking_id:  booking.booking_id,
    full_name:   passenger.full_name.trim(),
    passport_no: passenger.passport_no.trim().toUpperCase(),
    nationality: passenger.nationality.trim(),
    dob:         passenger.dob,
  })

  if (passengerError) {
    console.error('Passenger insert error:', passengerError.message)
  }

  return {
    bookingId: booking.booking_id,
    pnrCode:   booking.pnr_code,
  }
}

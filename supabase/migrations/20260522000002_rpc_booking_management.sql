-- ============================================================
-- Migration: Booking Management RPC Functions
-- ============================================================

----------------------------------------------------------------
-- 1. cancel_booking
-- Atomic cancellation: cancels booking, releases seat, triggers
-- time window validation.
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking public.bookings%ROWTYPE;
BEGIN
  -- Fetch the booking and lock it
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'cancel_booking: booking % not found', p_booking_id;
  END IF;

  -- Security Check: Caller must be the owner of the booking
  IF auth.uid() IS DISTINCT FROM v_booking.user_id THEN
    RAISE EXCEPTION 'cancel_booking: unauthorized — caller does not own this booking';
  END IF;

  -- Check if already cancelled
  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'cancel_booking: booking % is already cancelled', p_booking_id;
  END IF;

  -- Update booking status to cancelled (this fires trg_cancellation_guard)
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  -- Free the seat on the flight
  UPDATE public.seats
  SET is_available = true
  WHERE id = v_booking.seat_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;


----------------------------------------------------------------
-- 2. reschedule_booking
-- Atomic reschedule: releases old seat, finds available seat of
-- same class on new flight, charges price diff, updates booking.
----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking        public.bookings%ROWTYPE;
  v_old_seat       public.seats%ROWTYPE;
  v_new_seat       public.seats%ROWTYPE;
  v_old_flight     public.flights%ROWTYPE;
  v_new_flight     public.flights%ROWTYPE;
  v_price_diff     numeric(10,2) := 0.00;
BEGIN
  -- 1. Fetch booking and lock it
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_booking: booking % not found', p_booking_id;
  END IF;

  -- Security Check: Caller must be the owner of the booking
  IF auth.uid() IS DISTINCT FROM v_booking.user_id THEN
    RAISE EXCEPTION 'reschedule_booking: unauthorized — caller does not own this booking';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'reschedule_booking: cannot reschedule a cancelled booking';
  END IF;

  -- 2. Fetch old flight and old seat
  SELECT * INTO v_old_flight
  FROM public.flights
  WHERE id = v_booking.flight_id;

  SELECT * INTO v_old_seat
  FROM public.seats
  WHERE id = v_booking.seat_id;

  -- 3. Fetch new flight
  SELECT * INTO v_new_flight
  FROM public.flights
  WHERE id = p_new_flight_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_booking: new flight % not found', p_new_flight_id;
  END IF;

  IF v_new_flight.status NOT IN ('scheduled', 'delayed') THEN
    RAISE EXCEPTION 'reschedule_booking: new flight % is not active (status: %)', v_new_flight.flight_no, v_new_flight.status;
  END IF;

  -- 4. Safety Guard: Check if old flight departure is less than 2 hours away
  IF v_old_flight.departs_at - now() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Reschedule not allowed: flight % departs at % (less than 2 hours from now)',
      v_old_flight.flight_no,
      to_char(v_old_flight.departs_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC');
  END IF;

  -- 5. Find an available seat of the SAME class on the new flight and lock it
  SELECT * INTO v_new_seat
  FROM public.seats
  WHERE flight_id = p_new_flight_id
    AND class = v_old_seat.class
    AND is_available = true
  ORDER BY seat_number ASC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reschedule_booking: no available seats in % class on flight %', v_old_seat.class, v_new_flight.flight_no;
  END IF;

  -- 6. Calculate price difference
  -- If new flight + new seat total is more than original booking total_price, charge difference
  IF (v_new_flight.base_price + v_new_seat.extra_fee) > v_booking.total_price THEN
    v_price_diff := (v_new_flight.base_price + v_new_seat.extra_fee) - v_booking.total_price;
  END IF;

  -- 7. Release old seat
  UPDATE public.seats
  SET is_available = true
  WHERE id = v_old_seat.id;

  -- 8. Reserve new seat
  UPDATE public.seats
  SET is_available = false
  WHERE id = v_new_seat.id;

  -- 9. Update booking
  UPDATE public.bookings
  SET flight_id = p_new_flight_id,
      seat_id = v_new_seat.id,
      total_price = total_price + v_price_diff,
      status = 'rescheduled'
  WHERE id = p_booking_id;

  -- 10. Log the reschedule action
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_price_diff);

END;
$$;

REVOKE ALL ON FUNCTION public.reschedule_booking(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reschedule_booking(uuid, uuid) TO authenticated;

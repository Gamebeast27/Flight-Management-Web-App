-- ============================================================
-- Migration: Fix reserve_seat — resolve pnr_code column ambiguity
-- Renames the RETURNS TABLE column from pnr_code to out_pnr_code
-- to avoid Supabase PostgREST column name clash with bookings.pnr_code
-- ============================================================

CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_seat_id   uuid,
  p_user_id   uuid,
  p_flight_id uuid
)
RETURNS TABLE (booking_id uuid, pnr_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat        public.seats%ROWTYPE;
  v_flight      public.flights%ROWTYPE;
  v_booking_id  uuid;
  v_pnr         text;
  v_total_price numeric(10,2);
  v_attempts    int := 0;
BEGIN
  -- ── Security gate ─────────────────────────────────────────
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'reserve_seat: unauthorized — caller uid does not match p_user_id';
  END IF;

  -- ── Lock seat row (prevents concurrent double-booking) ────
  SELECT * INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reserve_seat: seat % not found', p_seat_id;
  END IF;

  IF NOT v_seat.is_available THEN
    RAISE EXCEPTION 'reserve_seat: seat % is no longer available', v_seat.seat_number;
  END IF;

  -- ── Validate flight ───────────────────────────────────────
  SELECT * INTO v_flight
  FROM public.flights
  WHERE id = p_flight_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'reserve_seat: flight % not found', p_flight_id;
  END IF;

  IF v_flight.status NOT IN ('scheduled', 'delayed') THEN
    RAISE EXCEPTION 'reserve_seat: flight % is not bookable (status: %)', v_flight.flight_no, v_flight.status;
  END IF;

  -- ── Compute total price ───────────────────────────────────
  v_total_price := v_flight.base_price + v_seat.extra_fee;

  -- ── Generate unique 6-char uppercase PNR ─────────────────
  LOOP
    v_pnr := upper(substring(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.pnr_code = v_pnr
    );
    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'reserve_seat: failed to generate unique PNR after 10 attempts';
    END IF;
  END LOOP;

  -- ── Mark seat as unavailable ──────────────────────────────
  UPDATE public.seats
  SET is_available = false
  WHERE id = p_seat_id;

  -- ── Create booking ────────────────────────────────────────
  INSERT INTO public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, v_total_price, v_pnr)
  RETURNING id INTO v_booking_id;

  -- Return using explicit aliases to avoid column name ambiguity
  RETURN QUERY SELECT v_booking_id AS booking_id, v_pnr AS pnr_code;
END;
$$;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.reserve_seat(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_seat(uuid, uuid, uuid) TO authenticated;

-- ============================================================
-- Migration: Enable RLS and write all policies
-- ============================================================

-- Enable RLS on every table ---------------------------------
ALTER TABLE public.flights     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- flights: publicly readable (anonymous + authenticated)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "flights_public_read"
  ON public.flights
  FOR SELECT
  USING (true);


-- ────────────────────────────────────────────────────────────
-- seats: publicly readable
-- ────────────────────────────────────────────────────────────
CREATE POLICY "seats_public_read"
  ON public.seats
  FOR SELECT
  USING (true);


-- ────────────────────────────────────────────────────────────
-- bookings: users own their bookings
-- ────────────────────────────────────────────────────────────
CREATE POLICY "bookings_select_own"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON public.bookings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_delete_own"
  ON public.bookings
  FOR DELETE
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- passengers: accessible only via owned bookings
-- ────────────────────────────────────────────────────────────
CREATE POLICY "passengers_select_own"
  ON public.passengers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON public.passengers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_update_own"
  ON public.passengers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_delete_own"
  ON public.passengers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- reschedules: accessible only via owned bookings
-- ────────────────────────────────────────────────────────────
CREATE POLICY "reschedules_select_own"
  ON public.reschedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON public.reschedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id
        AND b.user_id = auth.uid()
    )
  );

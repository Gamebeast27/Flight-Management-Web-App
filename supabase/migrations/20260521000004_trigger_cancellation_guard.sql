-- ============================================================
-- Migration: Cancellation guard trigger
-- Rejects status→'cancelled' if departure is within 2 hours
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_departs_at timestamptz;
  v_flight_no  text;
BEGIN
  -- Only fire when status changes TO 'cancelled' from a non-cancelled state
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN

    SELECT departs_at, flight_no
      INTO v_departs_at, v_flight_no
    FROM public.flights
    WHERE id = NEW.flight_id;

    IF v_departs_at IS NULL THEN
      RAISE EXCEPTION 'cancellation_guard: flight not found for booking %', NEW.id;
    END IF;

    IF v_departs_at - now() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION
        'Cancellation not allowed: flight % departs at % (less than 2 hours from now)',
        v_flight_no,
        to_char(v_departs_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC');
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to bookings BEFORE UPDATE
DROP TRIGGER IF EXISTS trg_cancellation_guard ON public.bookings;

CREATE TRIGGER trg_cancellation_guard
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cancellation_window();

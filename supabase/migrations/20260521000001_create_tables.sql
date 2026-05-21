-- ============================================================
-- Migration: Create core tables
-- ============================================================

-- flights ---------------------------------------------------
CREATE TABLE public.flights (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no     text        NOT NULL,
  origin        text        NOT NULL,          -- IATA code e.g. 'DEL'
  destination   text        NOT NULL,          -- IATA code e.g. 'BOM'
  departs_at    timestamptz NOT NULL,
  arrives_at    timestamptz NOT NULL,
  aircraft_type text        NOT NULL,
  status        text        NOT NULL DEFAULT 'scheduled'
                            CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed')),
  base_price    numeric(10,2) NOT NULL CHECK (base_price >= 0)
);

-- seats -----------------------------------------------------
CREATE TABLE public.seats (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id     uuid        NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  seat_number   text        NOT NULL,          -- e.g. '12A'
  class         text        NOT NULL
                            CHECK (class IN ('economy', 'business', 'first')),
  is_available  boolean     NOT NULL DEFAULT true,
  extra_fee     numeric(10,2) NOT NULL DEFAULT 0 CHECK (extra_fee >= 0),
  UNIQUE (flight_id, seat_number)
);

-- bookings --------------------------------------------------
CREATE TABLE public.bookings (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id     uuid        NOT NULL REFERENCES public.flights(id),
  seat_id       uuid        NOT NULL REFERENCES public.seats(id),
  status        text        NOT NULL DEFAULT 'confirmed'
                            CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
  booked_at     timestamptz NOT NULL DEFAULT now(),
  total_price   numeric(10,2) NOT NULL CHECK (total_price >= 0),
  pnr_code      text        NOT NULL UNIQUE
);

-- passengers ------------------------------------------------
CREATE TABLE public.passengers (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid  NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name     text  NOT NULL,
  passport_no   text  NOT NULL,
  nationality   text  NOT NULL,
  dob           date  NOT NULL
);

-- reschedules -----------------------------------------------
CREATE TABLE public.reschedules (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_flight_id   uuid        NOT NULL REFERENCES public.flights(id),
  new_flight_id   uuid        NOT NULL REFERENCES public.flights(id),
  requested_at    timestamptz NOT NULL DEFAULT now(),
  fee_charged     numeric(10,2) NOT NULL DEFAULT 0
);

-- Indexes for common query patterns -------------------------
CREATE INDEX idx_flights_origin_dest    ON public.flights (origin, destination);
CREATE INDEX idx_flights_departs_at     ON public.flights (departs_at);
CREATE INDEX idx_seats_flight_id        ON public.seats (flight_id);
CREATE INDEX idx_seats_available        ON public.seats (flight_id, is_available);
CREATE INDEX idx_bookings_user_id       ON public.bookings (user_id);
CREATE INDEX idx_bookings_flight_id     ON public.bookings (flight_id);
CREATE INDEX idx_passengers_booking_id  ON public.passengers (booking_id);
CREATE INDEX idx_reschedules_booking_id ON public.reschedules (booking_id);

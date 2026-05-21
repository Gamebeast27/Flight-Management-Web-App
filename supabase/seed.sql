-- ============================================================
-- Seed Data: 8 flights across 4 routes, full seat maps
-- ============================================================
-- ⚠️  TEST USER SETUP (cannot be done via SQL — see README)
--     Email   : test@flightapp.dev
--     Password: TestFlight@123
--     Create via: Supabase Dashboard → Authentication → Users
-- ============================================================

DO $$
DECLARE
  -- Flight IDs
  f1  uuid; f2  uuid; f3  uuid; f4  uuid;
  f5  uuid; f6  uuid; f7  uuid; f8  uuid;

  -- Seat generation variables
  flight_id   uuid;
  row_num     int;
  col         text;
  seat_label  text;
  seat_class  text;
  fee         numeric(10,2);
  economy_cols  text[] := ARRAY['A','B','C','D','E','F'];
  business_cols text[] := ARRAY['A','B','C','D'];
  first_cols    text[] := ARRAY['A','B'];
BEGIN

  -- ──────────────────────────────────────────────────────────
  -- INSERT FLIGHTS
  -- Dates: ~30 days out from 2026-05-22, spread across routes
  -- ──────────────────────────────────────────────────────────

  -- Route 1: DEL → BOM (2 flights)
  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('AI101', 'DEL', 'BOM', '2026-06-15 06:00:00+05:30', '2026-06-15 08:10:00+05:30', 'Airbus A320', 'scheduled', 4500.00)
  RETURNING id INTO f1;

  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('6E202', 'DEL', 'BOM', '2026-06-15 14:30:00+05:30', '2026-06-15 16:40:00+05:30', 'Boeing 737', 'scheduled', 3800.00)
  RETURNING id INTO f2;

  -- Route 2: BOM → BLR (2 flights)
  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('SG303', 'BOM', 'BLR', '2026-06-16 09:00:00+05:30', '2026-06-16 10:45:00+05:30', 'Airbus A320neo', 'scheduled', 3200.00)
  RETURNING id INTO f3;

  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('IX404', 'BOM', 'BLR', '2026-06-16 18:00:00+05:30', '2026-06-16 19:50:00+05:30', 'Boeing 737 MAX', 'scheduled', 2900.00)
  RETURNING id INTO f4;

  -- Route 3: DEL → BLR (2 flights)
  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('AI505', 'DEL', 'BLR', '2026-06-17 07:15:00+05:30', '2026-06-17 10:00:00+05:30', 'Boeing 777', 'scheduled', 6200.00)
  RETURNING id INTO f5;

  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('6E606', 'DEL', 'BLR', '2026-06-17 20:00:00+05:30', '2026-06-17 22:45:00+05:30', 'Airbus A321', 'scheduled', 5500.00)
  RETURNING id INTO f6;

  -- Route 4: BOM → HYD (2 flights)
  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('SG707', 'BOM', 'HYD', '2026-06-18 11:30:00+05:30', '2026-06-18 13:00:00+05:30', 'ATR 72', 'scheduled', 2400.00)
  RETURNING id INTO f7;

  INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  VALUES ('IX808', 'BOM', 'HYD', '2026-06-18 16:45:00+05:30', '2026-06-18 18:15:00+05:30', 'Airbus A320', 'scheduled', 2100.00)
  RETURNING id INTO f8;

  -- ──────────────────────────────────────────────────────────
  -- GENERATE SEAT MAPS FOR EACH FLIGHT
  -- Economy  : rows  1-20, cols A-F (120 seats, fee ₹0)
  -- Business : rows 21-25, cols A-D  (20 seats, fee ₹3000)
  -- First    : rows 26-28, cols A-B   (6 seats, fee ₹8000)
  -- Total: 146 seats × 8 flights = 1,168 rows
  -- ──────────────────────────────────────────────────────────

  FOREACH flight_id IN ARRAY ARRAY[f1, f2, f3, f4, f5, f6, f7, f8]
  LOOP

    -- Economy rows 1-20
    FOR row_num IN 1..20 LOOP
      FOREACH col IN ARRAY economy_cols LOOP
        seat_label := row_num::text || col;
        INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (flight_id, seat_label, 'economy', true, 0.00);
      END LOOP;
    END LOOP;

    -- Business rows 21-25
    FOR row_num IN 21..25 LOOP
      FOREACH col IN ARRAY business_cols LOOP
        seat_label := row_num::text || col;
        INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (flight_id, seat_label, 'business', true, 3000.00);
      END LOOP;
    END LOOP;

    -- First class rows 26-28
    FOR row_num IN 26..28 LOOP
      FOREACH col IN ARRAY first_cols LOOP
        seat_label := row_num::text || col;
        INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
        VALUES (flight_id, seat_label, 'first', true, 8000.00);
      END LOOP;
    END LOOP;

  END LOOP;

  RAISE NOTICE 'Seed complete: 8 flights, 1168 seats inserted';
END;
$$;

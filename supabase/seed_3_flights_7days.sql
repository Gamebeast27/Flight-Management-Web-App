-- ============================================================
-- Seed Data: 115+ flights across 12 routes for next 7 days
-- Date range: 2026-05-23 to 2026-05-29
-- Routes: DEL<->BOM, BOM<->BLR, DEL<->BLR, BOM<->HYD, DEL<->HYD, BLR<->HYD
--
-- HOW TO RUN:
--   Paste the entire file into Supabase SQL Editor and click Run.
--   Uses ON CONFLICT DO NOTHING — safe to re-run.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- STEP 1: Create a helper procedure OUTSIDE the anonymous block
--         (PostgreSQL does not allow procedure definitions inside DO blocks)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE PROCEDURE _seed_insert_seats(p_flight_id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  r   int;
  c   text;
  lbl text;
BEGIN
  -- Economy rows 1-20 (cols A-F, 6 seats/row = 120 seats)
  FOR r IN 1..20 LOOP
    FOREACH c IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      lbl := r::text || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, lbl, 'economy', true, 0.00)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Business rows 21-25 (cols A-D, 4 seats/row = 20 seats)
  FOR r IN 21..25 LOOP
    FOREACH c IN ARRAY ARRAY['A','B','C','D'] LOOP
      lbl := r::text || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, lbl, 'business', true, 3000.00)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- First class rows 26-28 (cols A-B, 2 seats/row = 6 seats)
  FOR r IN 26..28 LOOP
    FOREACH c IN ARRAY ARRAY['A','B'] LOOP
      lbl := r::text || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, lbl, 'first', true, 8000.00)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- STEP 2: Insert all flights and generate seat maps
-- ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  fid uuid;
BEGIN

-- ══════════════════════════════════════════════════════════════
-- DAY 1: 2026-05-23
-- ══════════════════════════════════════════════════════════════

-- DEL → BOM
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI101', 'DEL', 'BOM', '2026-05-23 06:00:00+05:30', '2026-05-23 08:10:00+05:30', 'Airbus A320', 'scheduled', 4500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E102', 'DEL', 'BOM', '2026-05-23 09:30:00+05:30', '2026-05-23 11:45:00+05:30', 'Boeing 737', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG103', 'DEL', 'BOM', '2026-05-23 14:30:00+05:30', '2026-05-23 16:40:00+05:30', 'Airbus A321', 'scheduled', 4200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX104', 'DEL', 'BOM', '2026-05-23 19:00:00+05:30', '2026-05-23 21:15:00+05:30', 'Boeing 737 MAX', 'scheduled', 3500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BOM → DEL
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI201', 'BOM', 'DEL', '2026-05-23 07:00:00+05:30', '2026-05-23 09:15:00+05:30', 'Airbus A320', 'scheduled', 4600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E202', 'BOM', 'DEL', '2026-05-23 12:00:00+05:30', '2026-05-23 14:20:00+05:30', 'Boeing 737', 'scheduled', 3900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG203', 'BOM', 'DEL', '2026-05-23 20:00:00+05:30', '2026-05-23 22:15:00+05:30', 'Airbus A321', 'scheduled', 4100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BOM → BLR
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI301', 'BOM', 'BLR', '2026-05-23 08:00:00+05:30', '2026-05-23 09:45:00+05:30', 'Airbus A320neo', 'scheduled', 3200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E302', 'BOM', 'BLR', '2026-05-23 15:30:00+05:30', '2026-05-23 17:15:00+05:30', 'Boeing 737 MAX', 'scheduled', 2800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BLR → BOM
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI401', 'BLR', 'BOM', '2026-05-23 10:30:00+05:30', '2026-05-23 12:20:00+05:30', 'Airbus A320', 'scheduled', 3100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG402', 'BLR', 'BOM', '2026-05-23 18:00:00+05:30', '2026-05-23 19:50:00+05:30', 'Boeing 737', 'scheduled', 2900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- DEL → BLR
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI501', 'DEL', 'BLR', '2026-05-23 07:15:00+05:30', '2026-05-23 10:00:00+05:30', 'Boeing 777', 'scheduled', 6200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E502', 'DEL', 'BLR', '2026-05-23 16:00:00+05:30', '2026-05-23 18:45:00+05:30', 'Airbus A321', 'scheduled', 5500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BLR → DEL
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI601', 'BLR', 'DEL', '2026-05-23 11:00:00+05:30', '2026-05-23 13:45:00+05:30', 'Boeing 777', 'scheduled', 6000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BOM → HYD
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG601', 'BOM', 'HYD', '2026-05-23 11:30:00+05:30', '2026-05-23 13:00:00+05:30', 'ATR 72', 'scheduled', 2400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX602', 'BOM', 'HYD', '2026-05-23 18:00:00+05:30', '2026-05-23 19:30:00+05:30', 'Airbus A320', 'scheduled', 2100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- HYD → BOM
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG603', 'HYD', 'BOM', '2026-05-23 14:00:00+05:30', '2026-05-23 15:30:00+05:30', 'ATR 72', 'scheduled', 2300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- DEL → HYD
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI701', 'DEL', 'HYD', '2026-05-23 08:30:00+05:30', '2026-05-23 10:45:00+05:30', 'Airbus A321', 'scheduled', 5200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- HYD → DEL
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E702', 'HYD', 'DEL', '2026-05-23 13:00:00+05:30', '2026-05-23 15:15:00+05:30', 'Boeing 737', 'scheduled', 5100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- BLR → HYD
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI801', 'BLR', 'HYD', '2026-05-23 09:30:00+05:30', '2026-05-23 10:30:00+05:30', 'ATR 72', 'scheduled', 1800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- HYD → BLR
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG802', 'HYD', 'BLR', '2026-05-23 14:00:00+05:30', '2026-05-23 15:00:00+05:30', 'ATR 72', 'scheduled', 1900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 2: 2026-05-24
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI105', 'DEL', 'BOM', '2026-05-24 06:30:00+05:30', '2026-05-24 08:40:00+05:30', 'Airbus A320', 'scheduled', 4700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E106', 'DEL', 'BOM', '2026-05-24 10:00:00+05:30', '2026-05-24 12:10:00+05:30', 'Boeing 737', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG107', 'DEL', 'BOM', '2026-05-24 15:00:00+05:30', '2026-05-24 17:10:00+05:30', 'Airbus A321', 'scheduled', 3600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX108', 'DEL', 'BOM', '2026-05-24 20:30:00+05:30', '2026-05-24 22:40:00+05:30', 'Boeing 737 MAX', 'scheduled', 3300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI205', 'BOM', 'DEL', '2026-05-24 07:30:00+05:30', '2026-05-24 09:45:00+05:30', 'Airbus A320', 'scheduled', 4800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E206', 'BOM', 'DEL', '2026-05-24 13:00:00+05:30', '2026-05-24 15:20:00+05:30', 'Boeing 737', 'scheduled', 4100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG207', 'BOM', 'DEL', '2026-05-24 21:00:00+05:30', '2026-05-24 23:15:00+05:30', 'Airbus A321', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI305', 'BOM', 'BLR', '2026-05-24 09:00:00+05:30', '2026-05-24 10:45:00+05:30', 'Airbus A320neo', 'scheduled', 3400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E306', 'BOM', 'BLR', '2026-05-24 16:30:00+05:30', '2026-05-24 18:15:00+05:30', 'Boeing 737 MAX', 'scheduled', 3000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG307', 'BOM', 'BLR', '2026-05-24 21:30:00+05:30', '2026-05-24 23:15:00+05:30', 'Airbus A320', 'scheduled', 2600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI405', 'BLR', 'BOM', '2026-05-24 11:00:00+05:30', '2026-05-24 12:50:00+05:30', 'Airbus A320', 'scheduled', 3300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG406', 'BLR', 'BOM', '2026-05-24 19:00:00+05:30', '2026-05-24 20:50:00+05:30', 'Boeing 737', 'scheduled', 3100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI505', 'DEL', 'BLR', '2026-05-24 08:00:00+05:30', '2026-05-24 10:45:00+05:30', 'Boeing 777', 'scheduled', 6500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E506', 'DEL', 'BLR', '2026-05-24 17:00:00+05:30', '2026-05-24 19:45:00+05:30', 'Airbus A321', 'scheduled', 5800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI605', 'BLR', 'DEL', '2026-05-24 12:00:00+05:30', '2026-05-24 14:45:00+05:30', 'Boeing 777', 'scheduled', 6300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG606', 'BLR', 'DEL', '2026-05-24 20:00:00+05:30', '2026-05-24 22:45:00+05:30', 'Airbus A321', 'scheduled', 5900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG705', 'BOM', 'HYD', '2026-05-24 10:00:00+05:30', '2026-05-24 11:30:00+05:30', 'ATR 72', 'scheduled', 2600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX706', 'BOM', 'HYD', '2026-05-24 17:00:00+05:30', '2026-05-24 18:30:00+05:30', 'Airbus A320', 'scheduled', 2200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG707', 'HYD', 'BOM', '2026-05-24 12:30:00+05:30', '2026-05-24 14:00:00+05:30', 'ATR 72', 'scheduled', 2500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX708', 'HYD', 'BOM', '2026-05-24 20:00:00+05:30', '2026-05-24 21:30:00+05:30', 'Airbus A320', 'scheduled', 2400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI801', 'DEL', 'HYD', '2026-05-24 08:30:00+05:30', '2026-05-24 10:45:00+05:30', 'Airbus A321', 'scheduled', 5200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E802', 'HYD', 'DEL', '2026-05-24 13:00:00+05:30', '2026-05-24 15:15:00+05:30', 'Boeing 737', 'scheduled', 5100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI901', 'BLR', 'HYD', '2026-05-24 09:30:00+05:30', '2026-05-24 10:30:00+05:30', 'ATR 72', 'scheduled', 1800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG902', 'HYD', 'BLR', '2026-05-24 14:00:00+05:30', '2026-05-24 15:00:00+05:30', 'ATR 72', 'scheduled', 1900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 3: 2026-05-25
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI109', 'DEL', 'BOM', '2026-05-25 07:00:00+05:30', '2026-05-25 09:10:00+05:30', 'Airbus A320', 'scheduled', 4900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E110', 'DEL', 'BOM', '2026-05-25 11:30:00+05:30', '2026-05-25 13:40:00+05:30', 'Boeing 737', 'scheduled', 4100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG111', 'DEL', 'BOM', '2026-05-25 16:00:00+05:30', '2026-05-25 18:10:00+05:30', 'Airbus A321', 'scheduled', 3700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX112', 'DEL', 'BOM', '2026-05-25 21:00:00+05:30', '2026-05-25 23:10:00+05:30', 'Boeing 737 MAX', 'scheduled', 3400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI209', 'BOM', 'DEL', '2026-05-25 08:00:00+05:30', '2026-05-25 10:15:00+05:30', 'Airbus A320', 'scheduled', 5000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E210', 'BOM', 'DEL', '2026-05-25 14:00:00+05:30', '2026-05-25 16:20:00+05:30', 'Boeing 737', 'scheduled', 4200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG211', 'BOM', 'DEL', '2026-05-25 20:30:00+05:30', '2026-05-25 22:45:00+05:30', 'Airbus A321', 'scheduled', 3900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI309', 'BOM', 'BLR', '2026-05-25 10:00:00+05:30', '2026-05-25 11:45:00+05:30', 'Airbus A320neo', 'scheduled', 3600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG310', 'BOM', 'BLR', '2026-05-25 18:00:00+05:30', '2026-05-25 19:45:00+05:30', 'Boeing 737', 'scheduled', 3100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI409', 'BLR', 'BOM', '2026-05-25 12:00:00+05:30', '2026-05-25 13:50:00+05:30', 'Airbus A320', 'scheduled', 3400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG410', 'BLR', 'BOM', '2026-05-25 20:30:00+05:30', '2026-05-25 22:20:00+05:30', 'Boeing 737', 'scheduled', 3200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI509', 'DEL', 'BLR', '2026-05-25 09:00:00+05:30', '2026-05-25 11:45:00+05:30', 'Boeing 777', 'scheduled', 6800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E510', 'DEL', 'BLR', '2026-05-25 18:30:00+05:30', '2026-05-25 21:15:00+05:30', 'Airbus A321', 'scheduled', 6000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI609', 'BLR', 'DEL', '2026-05-25 13:00:00+05:30', '2026-05-25 15:45:00+05:30', 'Boeing 777', 'scheduled', 6500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG709', 'BOM', 'HYD', '2026-05-25 11:00:00+05:30', '2026-05-25 12:30:00+05:30', 'ATR 72', 'scheduled', 2700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX710', 'BOM', 'HYD', '2026-05-25 18:00:00+05:30', '2026-05-25 19:30:00+05:30', 'Airbus A320', 'scheduled', 2300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG711', 'HYD', 'BOM', '2026-05-25 13:30:00+05:30', '2026-05-25 15:00:00+05:30', 'ATR 72', 'scheduled', 2600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI805', 'DEL', 'HYD', '2026-05-25 09:30:00+05:30', '2026-05-25 11:45:00+05:30', 'Airbus A321', 'scheduled', 5400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E806', 'HYD', 'DEL', '2026-05-25 14:00:00+05:30', '2026-05-25 16:15:00+05:30', 'Boeing 737', 'scheduled', 5300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI905', 'BLR', 'HYD', '2026-05-25 10:30:00+05:30', '2026-05-25 11:30:00+05:30', 'ATR 72', 'scheduled', 1900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG906', 'HYD', 'BLR', '2026-05-25 15:00:00+05:30', '2026-05-25 16:00:00+05:30', 'ATR 72', 'scheduled', 2000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 4: 2026-05-26
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI113', 'DEL', 'BOM', '2026-05-26 06:00:00+05:30', '2026-05-26 08:10:00+05:30', 'Airbus A320', 'scheduled', 5100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E114', 'DEL', 'BOM', '2026-05-26 12:30:00+05:30', '2026-05-26 14:40:00+05:30', 'Boeing 737', 'scheduled', 4300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG115', 'DEL', 'BOM', '2026-05-26 17:00:00+05:30', '2026-05-26 19:10:00+05:30', 'Airbus A321', 'scheduled', 3900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX116', 'DEL', 'BOM', '2026-05-26 22:00:00+05:30', '2026-05-27 00:10:00+05:30', 'Boeing 737 MAX', 'scheduled', 3200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI213', 'BOM', 'DEL', '2026-05-26 09:00:00+05:30', '2026-05-26 11:15:00+05:30', 'Airbus A320', 'scheduled', 5200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E214', 'BOM', 'DEL', '2026-05-26 15:00:00+05:30', '2026-05-26 17:20:00+05:30', 'Boeing 737', 'scheduled', 4400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG215', 'BOM', 'DEL', '2026-05-26 22:00:00+05:30', '2026-05-27 00:15:00+05:30', 'Airbus A321', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI313', 'BOM', 'BLR', '2026-05-26 07:30:00+05:30', '2026-05-26 09:15:00+05:30', 'Airbus A320neo', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG314', 'BOM', 'BLR', '2026-05-26 14:00:00+05:30', '2026-05-26 15:45:00+05:30', 'Boeing 737', 'scheduled', 3200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX315', 'BOM', 'BLR', '2026-05-26 20:00:00+05:30', '2026-05-26 21:45:00+05:30', 'Airbus A320', 'scheduled', 2700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI413', 'BLR', 'BOM', '2026-05-26 10:00:00+05:30', '2026-05-26 11:50:00+05:30', 'Airbus A320', 'scheduled', 3600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG414', 'BLR', 'BOM', '2026-05-26 16:00:00+05:30', '2026-05-26 17:50:00+05:30', 'Boeing 737', 'scheduled', 3400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI513', 'DEL', 'BLR', '2026-05-26 10:00:00+05:30', '2026-05-26 12:45:00+05:30', 'Boeing 777', 'scheduled', 7000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E514', 'DEL', 'BLR', '2026-05-26 19:00:00+05:30', '2026-05-26 21:45:00+05:30', 'Airbus A321', 'scheduled', 6200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI613', 'BLR', 'DEL', '2026-05-26 14:00:00+05:30', '2026-05-26 16:45:00+05:30', 'Boeing 777', 'scheduled', 6700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG713', 'BOM', 'HYD', '2026-05-26 08:00:00+05:30', '2026-05-26 09:30:00+05:30', 'ATR 72', 'scheduled', 2800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX714', 'BOM', 'HYD', '2026-05-26 16:30:00+05:30', '2026-05-26 18:00:00+05:30', 'Airbus A320', 'scheduled', 2400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG715', 'HYD', 'BOM', '2026-05-26 11:00:00+05:30', '2026-05-26 12:30:00+05:30', 'ATR 72', 'scheduled', 2700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX716', 'HYD', 'BOM', '2026-05-26 19:30:00+05:30', '2026-05-26 21:00:00+05:30', 'Airbus A320', 'scheduled', 2600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI809', 'DEL', 'HYD', '2026-05-26 10:00:00+05:30', '2026-05-26 12:15:00+05:30', 'Airbus A321', 'scheduled', 5600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E810', 'HYD', 'DEL', '2026-05-26 15:00:00+05:30', '2026-05-26 17:15:00+05:30', 'Boeing 737', 'scheduled', 5400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI909', 'BLR', 'HYD', '2026-05-26 11:00:00+05:30', '2026-05-26 12:00:00+05:30', 'ATR 72', 'scheduled', 2000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG910', 'HYD', 'BLR', '2026-05-26 16:00:00+05:30', '2026-05-26 17:00:00+05:30', 'ATR 72', 'scheduled', 2100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 5: 2026-05-27
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI117', 'DEL', 'BOM', '2026-05-27 06:00:00+05:30', '2026-05-27 08:10:00+05:30', 'Airbus A320', 'scheduled', 5300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E118', 'DEL', 'BOM', '2026-05-27 11:00:00+05:30', '2026-05-27 13:10:00+05:30', 'Boeing 737', 'scheduled', 4500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG119', 'DEL', 'BOM', '2026-05-27 15:30:00+05:30', '2026-05-27 17:40:00+05:30', 'Airbus A321', 'scheduled', 4100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX120', 'DEL', 'BOM', '2026-05-27 20:00:00+05:30', '2026-05-27 22:10:00+05:30', 'Boeing 737 MAX', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI217', 'BOM', 'DEL', '2026-05-27 07:00:00+05:30', '2026-05-27 09:15:00+05:30', 'Airbus A320', 'scheduled', 5400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E218', 'BOM', 'DEL', '2026-05-27 16:00:00+05:30', '2026-05-27 18:20:00+05:30', 'Boeing 737', 'scheduled', 4600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG219', 'BOM', 'DEL', '2026-05-27 21:30:00+05:30', '2026-05-27 23:45:00+05:30', 'Airbus A321', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI317', 'BOM', 'BLR', '2026-05-27 08:30:00+05:30', '2026-05-27 10:15:00+05:30', 'Airbus A320neo', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG318', 'BOM', 'BLR', '2026-05-27 16:00:00+05:30', '2026-05-27 17:45:00+05:30', 'Boeing 737', 'scheduled', 3300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI417', 'BLR', 'BOM', '2026-05-27 11:30:00+05:30', '2026-05-27 13:20:00+05:30', 'Airbus A320', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG418', 'BLR', 'BOM', '2026-05-27 19:00:00+05:30', '2026-05-27 20:50:00+05:30', 'Boeing 737', 'scheduled', 3600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI517', 'DEL', 'BLR', '2026-05-27 11:00:00+05:30', '2026-05-27 13:45:00+05:30', 'Boeing 777', 'scheduled', 7200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E518', 'DEL', 'BLR', '2026-05-27 20:00:00+05:30', '2026-05-27 22:45:00+05:30', 'Airbus A321', 'scheduled', 6400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI617', 'BLR', 'DEL', '2026-05-27 08:00:00+05:30', '2026-05-27 10:45:00+05:30', 'Boeing 777', 'scheduled', 6900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG618', 'BLR', 'DEL', '2026-05-27 16:00:00+05:30', '2026-05-27 18:45:00+05:30', 'Airbus A321', 'scheduled', 6200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG717', 'BOM', 'HYD', '2026-05-27 09:00:00+05:30', '2026-05-27 10:30:00+05:30', 'ATR 72', 'scheduled', 2900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX718', 'HYD', 'BOM', '2026-05-27 14:00:00+05:30', '2026-05-27 15:30:00+05:30', 'Airbus A320', 'scheduled', 2800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI813', 'DEL', 'HYD', '2026-05-27 11:00:00+05:30', '2026-05-27 13:15:00+05:30', 'Airbus A321', 'scheduled', 5800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E814', 'HYD', 'DEL', '2026-05-27 16:00:00+05:30', '2026-05-27 18:15:00+05:30', 'Boeing 737', 'scheduled', 5600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI913', 'BLR', 'HYD', '2026-05-27 12:00:00+05:30', '2026-05-27 13:00:00+05:30', 'ATR 72', 'scheduled', 2100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG914', 'HYD', 'BLR', '2026-05-27 17:00:00+05:30', '2026-05-27 18:00:00+05:30', 'ATR 72', 'scheduled', 2200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 6: 2026-05-28
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI121', 'DEL', 'BOM', '2026-05-28 06:30:00+05:30', '2026-05-28 08:40:00+05:30', 'Airbus A320', 'scheduled', 5500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E122', 'DEL', 'BOM', '2026-05-28 10:30:00+05:30', '2026-05-28 12:40:00+05:30', 'Boeing 737', 'scheduled', 4700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG123', 'DEL', 'BOM', '2026-05-28 16:00:00+05:30', '2026-05-28 18:10:00+05:30', 'Airbus A321', 'scheduled', 4300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX124', 'DEL', 'BOM', '2026-05-28 21:00:00+05:30', '2026-05-28 23:10:00+05:30', 'Boeing 737 MAX', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI221', 'BOM', 'DEL', '2026-05-28 08:00:00+05:30', '2026-05-28 10:15:00+05:30', 'Airbus A320', 'scheduled', 5600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E222', 'BOM', 'DEL', '2026-05-28 17:00:00+05:30', '2026-05-28 19:20:00+05:30', 'Boeing 737', 'scheduled', 4800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG223', 'BOM', 'DEL', '2026-05-28 22:30:00+05:30', '2026-05-29 00:45:00+05:30', 'Airbus A321', 'scheduled', 4400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI321', 'BOM', 'BLR', '2026-05-28 09:30:00+05:30', '2026-05-28 11:15:00+05:30', 'Airbus A320neo', 'scheduled', 4200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG322', 'BOM', 'BLR', '2026-05-28 18:30:00+05:30', '2026-05-28 20:15:00+05:30', 'Boeing 737', 'scheduled', 3500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI421', 'BLR', 'BOM', '2026-05-28 12:30:00+05:30', '2026-05-28 14:20:00+05:30', 'Airbus A320', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG422', 'BLR', 'BOM', '2026-05-28 20:00:00+05:30', '2026-05-28 21:50:00+05:30', 'Boeing 737', 'scheduled', 3700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI521', 'DEL', 'BLR', '2026-05-28 07:30:00+05:30', '2026-05-28 10:15:00+05:30', 'Boeing 777', 'scheduled', 7400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E522', 'DEL', 'BLR', '2026-05-28 18:00:00+05:30', '2026-05-28 20:45:00+05:30', 'Airbus A321', 'scheduled', 6600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI621', 'BLR', 'DEL', '2026-05-28 11:00:00+05:30', '2026-05-28 13:45:00+05:30', 'Boeing 777', 'scheduled', 7100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG622', 'BLR', 'DEL', '2026-05-28 19:00:00+05:30', '2026-05-28 21:45:00+05:30', 'Airbus A321', 'scheduled', 6400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG721', 'BOM', 'HYD', '2026-05-28 10:00:00+05:30', '2026-05-28 11:30:00+05:30', 'ATR 72', 'scheduled', 3000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX722', 'HYD', 'BOM', '2026-05-28 15:00:00+05:30', '2026-05-28 16:30:00+05:30', 'Airbus A320', 'scheduled', 2900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG723', 'BOM', 'HYD', '2026-05-28 20:00:00+05:30', '2026-05-28 21:30:00+05:30', 'Airbus A320', 'scheduled', 2700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI817', 'DEL', 'HYD', '2026-05-28 12:00:00+05:30', '2026-05-28 14:15:00+05:30', 'Airbus A321', 'scheduled', 6000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E818', 'HYD', 'DEL', '2026-05-28 17:00:00+05:30', '2026-05-28 19:15:00+05:30', 'Boeing 737', 'scheduled', 5800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI917', 'BLR', 'HYD', '2026-05-28 13:00:00+05:30', '2026-05-28 14:00:00+05:30', 'ATR 72', 'scheduled', 2200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG918', 'HYD', 'BLR', '2026-05-28 18:00:00+05:30', '2026-05-28 19:00:00+05:30', 'ATR 72', 'scheduled', 2300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

-- ══════════════════════════════════════════════════════════════
-- DAY 7: 2026-05-29
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI125', 'DEL', 'BOM', '2026-05-29 07:00:00+05:30', '2026-05-29 09:10:00+05:30', 'Airbus A320', 'scheduled', 5700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E126', 'DEL', 'BOM', '2026-05-29 12:00:00+05:30', '2026-05-29 14:10:00+05:30', 'Boeing 737', 'scheduled', 4900.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG127', 'DEL', 'BOM', '2026-05-29 17:00:00+05:30', '2026-05-29 19:10:00+05:30', 'Airbus A321', 'scheduled', 4500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX128', 'DEL', 'BOM', '2026-05-29 21:30:00+05:30', '2026-05-29 23:40:00+05:30', 'Boeing 737 MAX', 'scheduled', 4000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI225', 'BOM', 'DEL', '2026-05-29 08:30:00+05:30', '2026-05-29 10:45:00+05:30', 'Airbus A320', 'scheduled', 5800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E226', 'BOM', 'DEL', '2026-05-29 14:00:00+05:30', '2026-05-29 16:20:00+05:30', 'Boeing 737', 'scheduled', 5000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG227', 'BOM', 'DEL', '2026-05-29 22:00:00+05:30', '2026-05-30 00:15:00+05:30', 'Airbus A321', 'scheduled', 4200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI325', 'BOM', 'BLR', '2026-05-29 09:00:00+05:30', '2026-05-29 10:45:00+05:30', 'Airbus A320neo', 'scheduled', 4400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG326', 'BOM', 'BLR', '2026-05-29 19:00:00+05:30', '2026-05-29 20:45:00+05:30', 'Boeing 737', 'scheduled', 3700.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI425', 'BLR', 'BOM', '2026-05-29 11:00:00+05:30', '2026-05-29 12:50:00+05:30', 'Airbus A320', 'scheduled', 4200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG426', 'BLR', 'BOM', '2026-05-29 21:00:00+05:30', '2026-05-29 22:50:00+05:30', 'Boeing 737', 'scheduled', 3800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI525', 'DEL', 'BLR', '2026-05-29 08:00:00+05:30', '2026-05-29 10:45:00+05:30', 'Boeing 777', 'scheduled', 7600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E526', 'DEL', 'BLR', '2026-05-29 19:30:00+05:30', '2026-05-29 22:15:00+05:30', 'Airbus A321', 'scheduled', 6800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI625', 'BLR', 'DEL', '2026-05-29 09:00:00+05:30', '2026-05-29 11:45:00+05:30', 'Boeing 777', 'scheduled', 7300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG626', 'BLR', 'DEL', '2026-05-29 17:30:00+05:30', '2026-05-29 20:15:00+05:30', 'Airbus A321', 'scheduled', 6500.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG725', 'BOM', 'HYD', '2026-05-29 11:30:00+05:30', '2026-05-29 13:00:00+05:30', 'ATR 72', 'scheduled', 3100.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX726', 'BOM', 'HYD', '2026-05-29 18:00:00+05:30', '2026-05-29 19:30:00+05:30', 'Airbus A320', 'scheduled', 2600.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG727', 'HYD', 'BOM', '2026-05-29 15:00:00+05:30', '2026-05-29 16:30:00+05:30', 'ATR 72', 'scheduled', 3000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('IX728', 'HYD', 'BOM', '2026-05-29 21:00:00+05:30', '2026-05-29 22:30:00+05:30', 'Airbus A320', 'scheduled', 2800.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI821', 'DEL', 'HYD', '2026-05-29 13:00:00+05:30', '2026-05-29 15:15:00+05:30', 'Airbus A321', 'scheduled', 6200.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('6E822', 'HYD', 'DEL', '2026-05-29 18:00:00+05:30', '2026-05-29 20:15:00+05:30', 'Boeing 737', 'scheduled', 6000.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('AI921', 'BLR', 'HYD', '2026-05-29 10:00:00+05:30', '2026-05-29 11:00:00+05:30', 'ATR 72', 'scheduled', 2300.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES ('SG922', 'HYD', 'BLR', '2026-05-29 19:00:00+05:30', '2026-05-29 20:00:00+05:30', 'ATR 72', 'scheduled', 2400.00) RETURNING id INTO fid; IF fid IS NOT NULL THEN CALL _seed_insert_seats(fid); END IF; fid := NULL;

  RAISE NOTICE 'Seed complete: 7 days of flights inserted successfully!';
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- STEP 3: Clean up the temporary helper procedure
-- ──────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS _seed_insert_seats(uuid);

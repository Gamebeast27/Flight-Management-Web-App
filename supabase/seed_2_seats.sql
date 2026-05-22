-- ============================================================
-- Seed Part 2: Seats (1,168 rows — 146 per flight × 8 flights)
-- Run this SECOND, after seed_1_flights.sql
-- Uses set-based CROSS JOIN — executes in a single DB pass (no loop, no timeout)
-- ============================================================

INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
SELECT
  f.id,
  seat_map.seat_number,
  seat_map.class,
  true,
  seat_map.extra_fee
FROM public.flights f
CROSS JOIN (

  -- Economy: rows 1–20, columns A B C D E F  (120 seats, no extra fee)
  SELECT
    (row_num::text || col) AS seat_number,
    'economy'              AS class,
    0.00                   AS extra_fee
  FROM generate_series(1, 20) AS row_num
  CROSS JOIN unnest(ARRAY['A','B','C','D','E','F']) AS col

  UNION ALL

  -- Business: rows 21–25, columns A B C D  (20 seats, +₹3,000)
  SELECT
    (row_num::text || col),
    'business',
    3000.00
  FROM generate_series(21, 25) AS row_num
  CROSS JOIN unnest(ARRAY['A','B','C','D']) AS col

  UNION ALL

  -- First class: rows 26–28, columns A B  (6 seats, +₹8,000)
  SELECT
    (row_num::text || col),
    'first',
    8000.00
  FROM generate_series(26, 28) AS row_num
  CROSS JOIN unnest(ARRAY['A','B']) AS col

) AS seat_map
WHERE f.flight_no IN ('AI101','6E202','SG303','IX404','AI505','6E606','SG707','IX808');

-- ============================================================
-- Seed Part 1: Flights (8 rows)
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

INSERT INTO public.flights
  (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  -- Route 1: DEL → BOM
  ('AI101', 'DEL', 'BOM', '2026-06-15 06:00:00+05:30', '2026-06-15 08:10:00+05:30', 'Airbus A320',    'scheduled', 4500.00),
  ('6E202', 'DEL', 'BOM', '2026-06-15 14:30:00+05:30', '2026-06-15 16:40:00+05:30', 'Boeing 737',     'scheduled', 3800.00),
  -- Route 2: BOM → BLR
  ('SG303', 'BOM', 'BLR', '2026-06-16 09:00:00+05:30', '2026-06-16 10:45:00+05:30', 'Airbus A320neo', 'scheduled', 3200.00),
  ('IX404', 'BOM', 'BLR', '2026-06-16 18:00:00+05:30', '2026-06-16 19:50:00+05:30', 'Boeing 737 MAX', 'scheduled', 2900.00),
  -- Route 3: DEL → BLR
  ('AI505', 'DEL', 'BLR', '2026-06-17 07:15:00+05:30', '2026-06-17 10:00:00+05:30', 'Boeing 777',     'scheduled', 6200.00),
  ('6E606', 'DEL', 'BLR', '2026-06-17 20:00:00+05:30', '2026-06-17 22:45:00+05:30', 'Airbus A321',    'scheduled', 5500.00),
  -- Route 4: BOM → HYD
  ('SG707', 'BOM', 'HYD', '2026-06-18 11:30:00+05:30', '2026-06-18 13:00:00+05:30', 'ATR 72',         'scheduled', 2400.00),
  ('IX808', 'BOM', 'HYD', '2026-06-18 16:45:00+05:30', '2026-06-18 18:15:00+05:30', 'Airbus A320',    'scheduled', 2100.00);

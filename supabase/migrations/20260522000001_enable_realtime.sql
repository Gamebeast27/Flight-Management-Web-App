-- ============================================================
-- Migration: Enable Realtime on seats table
-- ============================================================

-- Add seats to the supabase_realtime publication
alter publication supabase_realtime add table public.seats;

-- =============================================
-- Add per-pax pricing matrix columns (private/standard 1..10)
-- Run this for existing databases that don't have these columns yet.
-- =============================================

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_1pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_2pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_3pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_4pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_5pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_6pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_7pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_8pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_9pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_price_10pax INTEGER;

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_1pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_2pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_3pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_4pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_5pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_6pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_7pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_8pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_9pax INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_price_10pax INTEGER;

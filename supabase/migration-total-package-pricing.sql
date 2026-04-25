-- =============================================
-- Add total package pricing columns (2/3 days)
-- Run this after base schema migration.sql
-- =============================================

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_total_2_days INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS private_total_3_days INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_total_2_days INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS standard_total_3_days INTEGER;

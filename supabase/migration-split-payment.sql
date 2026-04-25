-- =============================================
-- Migration: Add Split Payment Columns to Bookings
-- =============================================

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'full' CHECK (payment_type IN ('full', 'deposit')),
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER,
ADD COLUMN IF NOT EXISTS balance_amount INTEGER,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid')),
ADD COLUMN IF NOT EXISTS cancellation_status TEXT DEFAULT 'none' CHECK (cancellation_status IN ('none', 'requested', 'approved', 'rejected', 'refunded'));

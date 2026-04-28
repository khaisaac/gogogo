-- Add refund and payment tracking columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'payment_failed')),
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'full' CHECK (payment_type IN ('full', 'deposit')),
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER,
ADD COLUMN IF NOT EXISTS balance_amount INTEGER,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT NULL CHECK (refund_status IN ('requested', 'approved', 'rejected', 'completed')),
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_amount INTEGER,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_approval_notes TEXT,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deposit_reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_reminder_sent_at TIMESTAMPTZ;

-- Create refunds table for audit trail
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'completed')),
  approval_notes TEXT,
  provider_refund_id TEXT,
  payment_method TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Refunds RLS policies
CREATE POLICY "Users can view their own refunds"
  ON public.refunds FOR SELECT
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = refunds.booking_id
      AND (bookings.user_id = auth.uid() OR bookings.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Admins can view all refunds"
  ON public.refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update refunds"
  ON public.refunds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON public.bookings(refund_status);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON public.refunds(booking_id);

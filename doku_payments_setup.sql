-- Jika Anda sebelumnya sudah memiliki tabel "payments" yang strukturnya berbeda,
-- jalankan baris DROP TABLE di bawah ini untuk menghapus tabel lama (pastikan data lama aman/tidak diperlukan).
-- DROP TABLE IF EXISTS public.payments CASCADE;

-- Atau jika Anda ingin mempertahankan tabel lama dan hanya menambahkan kolom yang kurang:
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS invoice VARCHAR(255);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS parent_invoice VARCHAR(255);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(10, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_idr NUMERIC(15, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50);

-- Make invoice unique if possible
-- ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_key UNIQUE (invoice);

-- Jika Anda sudah menjalankan DROP TABLE di atas, jalankan blok di bawah ini untuk membuat dari awal:
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice VARCHAR(255) UNIQUE,
    parent_invoice VARCHAR(255),
    amount_usd NUMERIC(10, 2),
    amount_idr NUMERIC(15, 2),
    payment_type VARCHAR(50) CHECK (payment_type IN ('dp', 'full', 'pelunasan')),
    status VARCHAR(50) DEFAULT 'pending',
    refund_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for querying by invoice quickly
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice);
CREATE INDEX IF NOT EXISTS idx_payments_parent_invoice ON public.payments(parent_invoice);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it already exists to avoid errors, then recreate
DROP TRIGGER IF EXISTS update_payments_modtime ON public.payments;
CREATE TRIGGER update_payments_modtime
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- =============================================
-- Trekking Mount Rinjani — Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  whatsapp TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Auto-insert profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, whatsapp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  route TEXT NOT NULL CHECK (route IN ('sembalun', 'senaru')),
  duration TEXT NOT NULL,
  -- Legacy tiered columns (kept for backward compatibility)
  price_1pax INTEGER,
  price_2_3pax INTEGER,
  price_4_5pax INTEGER,
  price_6plus INTEGER,
  -- New pricing matrix: private (1-10 pax)
  private_price_1pax INTEGER,
  private_price_2pax INTEGER,
  private_price_3pax INTEGER,
  private_price_4pax INTEGER,
  private_price_5pax INTEGER,
  private_price_6pax INTEGER,
  private_price_7pax INTEGER,
  private_price_8pax INTEGER,
  private_price_9pax INTEGER,
  private_price_10pax INTEGER,
  -- New pricing matrix: standard (1-10 pax)
  standard_price_1pax INTEGER,
  standard_price_2pax INTEGER,
  standard_price_3pax INTEGER,
  standard_price_4pax INTEGER,
  standard_price_5pax INTEGER,
  standard_price_6pax INTEGER,
  standard_price_7pax INTEGER,
  standard_price_8pax INTEGER,
  standard_price_9pax INTEGER,
  standard_price_10pax INTEGER,
  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  image TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure new pricing matrix columns exist on already-created databases
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

-- Enable RLS on packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Packages RLS: public read, admin write
CREATE POLICY "Anyone can view active packages"
  ON public.packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON public.packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  trekking_date DATE NOT NULL,
  number_of_trekkers INTEGER NOT NULL CHECK (number_of_trekkers > 0),
  hotel_pickup_location TEXT NOT NULL,
  special_requirements TEXT,
  order_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price INTEGER,
  package_title TEXT, -- Denormalized for quick access
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS: Anyone can insert (guest checkout), users see their own, admins see all
CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Seed initial packages data
INSERT INTO public.packages (title, route, duration, price_1pax, price_2_3pax, price_4_5pax, price_6plus, difficulty, image, description)
VALUES
  ('Mount Rinjani 2 Days and 1 Night Summit Sembalun Route', 'sembalun', '2 Days', 190, 120, 115, 113, 4, '/sembalun.jpg', 'The most direct route to the summit of Mount Rinjani (3,726m). Experience breathtaking sunrise views from the highest point in Lombok.'),
  ('2 Days To 3 Days Sharing Group on Budget (Sembalun)', 'sembalun', '3 Days', NULL, 115, 115, 115, 3, '/hero-banner.png', 'Join a shared group trek for a budget-friendly adventure. Perfect for solo travelers and small groups.'),
  ('Mount Rinjani Trekking Summit 4 Days Sembalun to Torean', 'sembalun', '4 Days', 275, 225, 220, 200, 5, '/hero-banner.png', 'The ultimate Rinjani experience. Summit, lake, hot springs, and exit via the scenic Torean route.'),
  ('Mount Rinjani Trekking Summit 3 Days Sembalun to Torean', 'sembalun', '3 Days', 230, 170, 160, 155, 4, '/hero-banner.png', 'A shorter version of the full Rinjani traverse. Summit and lake in 3 action-packed days.'),
  ('Mount Rinjani Trekking 3 Days and 2 Nights Lake and Hot Spring', 'senaru', '3 Days', 230, 170, 160, 155, 3, '/senaru.jpg', 'The Green Route. Trek through lush forests to the stunning Segara Anak Lake and natural hot springs.'),
  ('Mount Rinjani Trekking Summit 4 Days Senaru to Sembalun', 'senaru', '4 Days', 275, 225, 220, 200, 4, '/hero-banner.png', 'Start from the forest side and finish at the savanna. A beautiful traverse of Mount Rinjani.'),
  ('Mount Rinjani 2 Days and 1 Night to Senaru Crater Rim', 'senaru', '2 Days', 169, 120, 115, 113, 3, '/hero-banner.png', 'A quick but rewarding trek to the Senaru Crater Rim with stunning views of the lake below.'),
  ('2 Days To 3 Days Sharing Group on Budget (Senaru)', 'senaru', '3 Days', NULL, 115, 115, 115, 3, '/hero-banner.png', 'Budget-friendly shared group trek via the scenic Senaru route.');

-- 5. Updated_at auto-update function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. Create Blog Tables (categories, tags, posts, post_tags)

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view and manage all posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Post Tags (junction table)
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post tags"
  ON public.post_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON public.post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Create Payments table (DOKU & PayPal)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('doku', 'paypal')),
  provider_order_id TEXT, -- DOKU invoice number or PayPal order ID
  provider_transaction_id TEXT, -- Transaction ID from provider
  amount INTEGER NOT NULL, -- Amount in smallest currency unit (cents/rupiah)
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  raw_response JSONB, -- Full response from payment provider for debugging
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = payments.booking_id
        AND (bookings.user_id = auth.uid()
          OR bookings.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert/update payments (for webhooks)
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

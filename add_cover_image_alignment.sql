-- Add cover_image_alignment column to posts table
ALTER TABLE public.posts
ADD COLUMN cover_image_alignment text DEFAULT 'center' CHECK (cover_image_alignment IN ('center', 'left', 'right'));

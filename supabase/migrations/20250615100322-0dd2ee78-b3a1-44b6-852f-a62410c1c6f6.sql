
-- Add missing columns to competitors table for enhanced profile data
ALTER TABLE public.competitors 
ADD COLUMN IF NOT EXISTS external_urls text,
ADD COLUMN IF NOT EXISTS is_business_account boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS business_category text,
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS highlight_reel_count integer,
ADD COLUMN IF NOT EXISTS igtvVideoCount integer;


-- Create a table for storing script drafts
CREATE TABLE public.script_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL DEFAULT 'Guión sin título',
  content text,
  editor_mode text NOT NULL DEFAULT 'structured' CHECK (editor_mode IN ('structured', 'free')),
  sections jsonb DEFAULT '[]'::jsonb,
  shots jsonb DEFAULT '[]'::jsonb,
  creative_items jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own script drafts
ALTER TABLE public.script_drafts ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own script drafts
CREATE POLICY "Users can view their own script drafts" 
  ON public.script_drafts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own script drafts
CREATE POLICY "Users can create their own script drafts" 
  ON public.script_drafts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own script drafts
CREATE POLICY "Users can update their own script drafts" 
  ON public.script_drafts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own script drafts
CREATE POLICY "Users can delete their own script drafts" 
  ON public.script_drafts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_script_drafts_updated_at
  BEFORE UPDATE ON public.script_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

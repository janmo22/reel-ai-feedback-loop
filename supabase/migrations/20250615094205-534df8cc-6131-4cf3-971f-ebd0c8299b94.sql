
-- Crear tabla para guardar secciones individuales con sus tomas
CREATE TABLE public.section_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sección sin título',
  content TEXT,
  shots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Habilitar RLS
ALTER TABLE public.section_drafts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que los usuarios solo vean sus propias secciones
CREATE POLICY "Users can view their own section drafts" 
  ON public.section_drafts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own section drafts" 
  ON public.section_drafts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own section drafts" 
  ON public.section_drafts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own section drafts" 
  ON public.section_drafts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_section_drafts_updated_at
  BEFORE UPDATE ON public.section_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

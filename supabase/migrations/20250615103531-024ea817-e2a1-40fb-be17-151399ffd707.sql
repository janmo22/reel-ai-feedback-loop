
-- Crear tabla para almacenar análisis de videos de competencia
CREATE TABLE IF NOT EXISTS public.competitor_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_video_id UUID NOT NULL REFERENCES public.competitor_videos(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  feedback_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_status TEXT NOT NULL DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'completed', 'failed'))
);

-- Agregar índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_video_id ON public.competitor_analysis(competitor_video_id);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_status ON public.competitor_analysis(analysis_status);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_created_at ON public.competitor_analysis(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para que los usuarios solo vean sus propios análisis
CREATE POLICY "Users can view their own competitor analysis" 
  ON public.competitor_analysis 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_videos cv 
      JOIN public.competitors c ON cv.competitor_id = c.id 
      WHERE cv.id = competitor_video_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own competitor analysis" 
  ON public.competitor_analysis 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitor_videos cv 
      JOIN public.competitors c ON cv.competitor_id = c.id 
      WHERE cv.id = competitor_video_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own competitor analysis" 
  ON public.competitor_analysis 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_videos cv 
      JOIN public.competitors c ON cv.competitor_id = c.id 
      WHERE cv.id = competitor_video_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own competitor analysis" 
  ON public.competitor_analysis 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_videos cv 
      JOIN public.competitors c ON cv.competitor_id = c.id 
      WHERE cv.id = competitor_video_id AND c.user_id = auth.uid()
    )
  );

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_competitor_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_competitor_analysis_updated_at_trigger ON public.competitor_analysis;
CREATE TRIGGER update_competitor_analysis_updated_at_trigger
    BEFORE UPDATE ON public.competitor_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_competitor_analysis_updated_at();

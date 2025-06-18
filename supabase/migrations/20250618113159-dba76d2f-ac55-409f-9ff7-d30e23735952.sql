
-- Agregar las nuevas columnas a la tabla competitor_analysis
ALTER TABLE public.competitor_analysis 
ADD COLUMN competitor_reel_analysis JSONB,
ADD COLUMN user_adaptation_proposal JSONB;

-- Actualizar la columna feedback_data para que sea opcional ya que ahora tendremos datos más estructurados
ALTER TABLE public.competitor_analysis 
ALTER COLUMN feedback_data DROP NOT NULL;

-- Crear índices para mejorar el rendimiento de las consultas JSON
CREATE INDEX idx_competitor_analysis_reel_analysis ON public.competitor_analysis USING GIN (competitor_reel_analysis);
CREATE INDEX idx_competitor_analysis_user_adaptation ON public.competitor_analysis USING GIN (user_adaptation_proposal);

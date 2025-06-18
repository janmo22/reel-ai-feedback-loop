
-- Permitir valores NULL en overall_score para la creación inicial de registros
ALTER TABLE public.competitor_analysis 
ALTER COLUMN overall_score DROP NOT NULL;

-- Establecer un valor por defecto de 0 para overall_score
ALTER TABLE public.competitor_analysis 
ALTER COLUMN overall_score SET DEFAULT 0;

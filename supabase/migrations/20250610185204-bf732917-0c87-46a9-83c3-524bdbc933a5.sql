
-- Crear tabla para content series
CREATE TABLE public.content_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para videos creados por el usuario
CREATE TABLE public.created_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  main_smp TEXT,
  secondary_smps TEXT[],
  hook TEXT,
  build_up TEXT,
  value_add TEXT,
  call_to_action TEXT,
  shots TEXT[],
  content_series_id UUID REFERENCES public.content_series(id),
  script_annotations JSONB, -- Para guardar las anotaciones del script con planos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para planos predefinidos del usuario
CREATE TABLE public.user_shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.content_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.created_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shots ENABLE ROW LEVEL SECURITY;

-- Políticas para content_series
CREATE POLICY "Users can view their own content series" 
  ON public.content_series 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own content series" 
  ON public.content_series 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own content series" 
  ON public.content_series 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own content series" 
  ON public.content_series 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas para created_videos
CREATE POLICY "Users can view their own created videos" 
  ON public.created_videos 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own videos" 
  ON public.created_videos 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own videos" 
  ON public.created_videos 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own videos" 
  ON public.created_videos 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas para user_shots
CREATE POLICY "Users can view their own shots" 
  ON public.user_shots 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shots" 
  ON public.user_shots 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shots" 
  ON public.user_shots 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own shots" 
  ON public.user_shots 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Crear trigger para updated_at en todas las tablas
CREATE TRIGGER update_content_series_updated_at
  BEFORE UPDATE ON public.content_series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_created_videos_updated_at
  BEFORE UPDATE ON public.created_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

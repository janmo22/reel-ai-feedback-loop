
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentSeries {
  id: string;
  name: string;
  description: string | null;
  target_audience: string | null;
  content_pillars: string | null;
  posting_frequency: string | null;
  goals: string | null;
  tone_style: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface CreateSeriesData {
  name: string;
  description?: string;
  target_audience?: string;
  content_pillars?: string;
  posting_frequency?: string;
  goals?: string;
  tone_style?: string;
}

interface UpdateSeriesData extends CreateSeriesData {
  id: string;
}

export const useContentSeries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contentSeries = [], isLoading } = useQuery({
    queryKey: ['content-series', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('content_series')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContentSeries[];
    },
    enabled: !!user
  });

  const createSeries = useMutation({
    mutationFn: async (seriesData: CreateSeriesData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('content_series')
        .insert({
          user_id: user.id,
          name: seriesData.name.trim(),
          description: seriesData.description?.trim() || null,
          target_audience: seriesData.target_audience?.trim() || null,
          content_pillars: seriesData.content_pillars?.trim() || null,
          posting_frequency: seriesData.posting_frequency?.trim() || null,
          goals: seriesData.goals?.trim() || null,
          tone_style: seriesData.tone_style?.trim() || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-series'] });
      toast({
        title: "Serie creada",
        description: "La content series ha sido creada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear serie",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateSeries = useMutation({
    mutationFn: async (seriesData: UpdateSeriesData) => {
      const { data, error } = await supabase
        .from('content_series')
        .update({
          name: seriesData.name.trim(),
          description: seriesData.description?.trim() || null,
          target_audience: seriesData.target_audience?.trim() || null,
          content_pillars: seriesData.content_pillars?.trim() || null,
          posting_frequency: seriesData.posting_frequency?.trim() || null,
          goals: seriesData.goals?.trim() || null,
          tone_style: seriesData.tone_style?.trim() || null
        })
        .eq('id', seriesData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-series'] });
      toast({
        title: "Serie actualizada",
        description: "La content series ha sido actualizada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar serie",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteSeries = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_series')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-series'] });
      toast({
        title: "Serie eliminada",
        description: "La content series ha sido eliminada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar serie",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    contentSeries,
    isLoading,
    createSeries,
    updateSeries,
    deleteSeries
  };
};

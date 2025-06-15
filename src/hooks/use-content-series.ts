
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentSeries {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
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
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('content_series')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null
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
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('content_series')
        .update({
          name: name.trim(),
          description: description?.trim() || null
        })
        .eq('id', id)
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

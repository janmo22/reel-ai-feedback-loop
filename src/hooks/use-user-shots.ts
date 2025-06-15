
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserShot {
  id: string;
  name: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
}

interface CreateShotData {
  name: string;
  description?: string;
  color?: string;
}

interface UpdateShotData extends CreateShotData {
  id: string;
}

export const useUserShots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userShots = [], isLoading } = useQuery({
    queryKey: ['user-shots', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_shots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserShot[];
    },
    enabled: !!user
  });

  const createShot = useMutation({
    mutationFn: async (shotData: CreateShotData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('user_shots')
        .insert({
          user_id: user.id,
          name: shotData.name.trim(),
          description: shotData.description?.trim() || null,
          color: shotData.color || '#3B82F6'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-shots'] });
      toast({
        title: "Plano creado",
        description: "El plano ha sido guardado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateShot = useMutation({
    mutationFn: async (shotData: UpdateShotData) => {
      const { data, error } = await supabase
        .from('user_shots')
        .update({
          name: shotData.name.trim(),
          description: shotData.description?.trim() || null,
          color: shotData.color || '#3B82F6'
        })
        .eq('id', shotData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-shots'] });
      toast({
        title: "Plano actualizado",
        description: "El plano ha sido actualizado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteShot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_shots')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-shots'] });
      toast({
        title: "Plano eliminado",
        description: "El plano ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    userShots,
    isLoading,
    createShot,
    updateShot,
    deleteShot
  };
};

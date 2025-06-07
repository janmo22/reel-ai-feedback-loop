
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface CompetitorData {
  id: string;
  instagram_username: string;
  display_name: string | null;
  profile_picture_url: string | null;
  follower_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  bio: string | null;
  is_verified: boolean;
  last_scraped_at: string | null;
  competitor_videos: CompetitorVideo[];
}

export interface CompetitorVideo {
  id: string;
  instagram_id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  posted_at: string | null;
  duration_seconds: number | null;
  hashtags_count: number | null;
  is_selected_for_analysis: boolean;
  competitor_analysis: any[];
}

export const useCompetitorScraping = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrapeCompetitor = async (username: string): Promise<CompetitorData | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para agregar competidores",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`Starting scraping for competitor: ${username}`);
      
      const { data, error } = await supabase.functions.invoke('scrape-competitor', {
        body: { 
          username: username.replace('@', ''), 
          userId: user.id,
          isMyProfile: false
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error en la función de scraping');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido en el scraping');
      }

      toast({
        title: "¡Competidor agregado!",
        description: `Se han extraído los datos de @${username} correctamente`,
      });

      return data.competitor;
      
    } catch (error) {
      console.error('Error scraping competitor:', error);
      toast({
        title: "Error al agregar competidor",
        description: error.message || "No se pudo extraer la información del competidor",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompetitors = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('competitors')
        .select(`
          *,
          competitor_videos (
            *,
            competitor_analysis (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCompetitors(data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los competidores",
        variant: "destructive"
      });
    }
  };

  const deleteCompetitor = async (competitorId: string) => {
    try {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;

      setCompetitors(prev => prev.filter(c => c.id !== competitorId));
      
      toast({
        title: "Competidor eliminado",
        description: "El competidor y sus videos han sido eliminados",
      });
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el competidor",
        variant: "destructive"
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('competitor_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      // Update local state
      setCompetitors(prev => 
        prev.map(competitor => ({
          ...competitor,
          competitor_videos: competitor.competitor_videos.filter(video => video.id !== videoId)
        }))
      );
      
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el video",
        variant: "destructive"
      });
    }
  };

  const refreshCompetitor = async (competitorId: string) => {
    try {
      const { data, error } = await supabase
        .from('competitors')
        .select(`
          *,
          competitor_videos (
            *,
            competitor_analysis (*)
          )
        `)
        .eq('id', competitorId)
        .single();

      if (error) throw error;

      setCompetitors(prev => 
        prev.map(competitor => 
          competitor.id === competitorId ? data : competitor
        )
      );

      return data;
    } catch (error) {
      console.error('Error refreshing competitor:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del competidor",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    isLoading,
    competitors,
    scrapeCompetitor,
    fetchCompetitors,
    deleteCompetitor,
    deleteVideo,
    refreshCompetitor
  };
};

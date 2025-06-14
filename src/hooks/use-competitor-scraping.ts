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
  external_urls: string | null;
  is_business_account: boolean;
  business_category: string | null;
  is_private: boolean;
  highlight_reel_count: number | null;
  igtvvideocount: number | null;
  last_scraped_at: string | null;
  competitor_videos: CompetitorVideo[];
  isLoading?: boolean;
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

// Helper function to ensure competitor data has all required fields
const ensureCompetitorData = (data: any): CompetitorData => ({
  id: data.id,
  instagram_username: data.instagram_username,
  display_name: data.display_name || null,
  profile_picture_url: data.profile_picture_url || null,
  follower_count: data.follower_count || null,
  following_count: data.following_count || null,
  posts_count: data.posts_count || null,
  bio: data.bio || null,
  is_verified: data.is_verified || false,
  external_urls: data.external_urls || null,
  is_business_account: data.is_business_account || false,
  business_category: data.business_category || null,
  is_private: data.is_private || false,
  highlight_reel_count: data.highlight_reel_count || null,
  igtvvideocount: data.igtvvideocount || null,
  last_scraped_at: data.last_scraped_at || null,
  competitor_videos: data.competitor_videos || [],
  isLoading: data.isLoading || false
});

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
    
    // Create a temporary competitor with loading state
    const tempCompetitor: CompetitorData = {
      id: `temp-${Date.now()}`,
      instagram_username: username.replace('@', ''),
      display_name: null,
      profile_picture_url: null,
      follower_count: null,
      following_count: null,
      posts_count: null,
      bio: null,
      is_verified: false,
      external_urls: null,
      is_business_account: false,
      business_category: null,
      is_private: false,
      highlight_reel_count: null,
      igtvvideocount: null,
      last_scraped_at: null,
      competitor_videos: [],
      isLoading: true
    };

    // Add temporary competitor to show loading state
    setCompetitors(prev => [tempCompetitor, ...prev]);

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

      // Remove temporary competitor and add real one
      setCompetitors(prev => prev.filter(c => c.id !== tempCompetitor.id));
      
      // Fetch the complete competitor data with analysis
      const { data: completeCompetitor, error: fetchError } = await supabase
        .from('competitors')
        .select(`
          *,
          competitor_videos!inner (
            *,
            competitor_analysis (*)
          )
        `)
        .eq('id', data.competitor.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete competitor:', fetchError);
        // If fetch fails, still add the basic competitor data with all required fields
        const basicCompetitor = ensureCompetitorData(data.competitor);
        setCompetitors(prev => [basicCompetitor, ...prev]);
      } else {
        // Ensure complete competitor has all required fields
        const enhancedCompetitor = ensureCompetitorData(completeCompetitor);
        setCompetitors(prev => [enhancedCompetitor, ...prev]);
      }

      toast({
        title: "¡Competidor agregado!",
        description: `Se han extraído los datos de @${username} correctamente`,
      });

      return data.competitor;
      
    } catch (error) {
      console.error('Error scraping competitor:', error);
      
      // Remove temporary competitor on error
      setCompetitors(prev => prev.filter(c => c.id !== tempCompetitor.id));
      
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
      
      // Ensure all competitors have the required fields
      const enhancedCompetitors: CompetitorData[] = (data || []).map(competitor => 
        ensureCompetitorData(competitor)
      );
      
      setCompetitors(enhancedCompetitors);
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

      // Ensure refreshed competitor has all required fields
      const enhancedCompetitor = ensureCompetitorData(data);

      setCompetitors(prev => 
        prev.map(competitor => 
          competitor.id === competitorId ? enhancedCompetitor : competitor
        )
      );

      return enhancedCompetitor;
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

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
  analysisStatus?: 'idle' | 'loading' | 'completed' | 'error';
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

  // SIMPLIFIED: Check if analysis is completed by looking at status OR data content
  const getVideoAnalysisStatus = (analysisArray: any[]): 'idle' | 'loading' | 'completed' | 'error' => {
    console.log('Hook: Checking analysis status for:', analysisArray);
    
    if (!analysisArray || analysisArray.length === 0) {
      console.log('Hook: No analysis data found - returning idle');
      return 'idle';
    }
    
    const analysis = analysisArray[0];
    console.log('Hook: Analysis object:', analysis);
    console.log('Hook: Analysis status field:', analysis.analysis_status);
    
    // Check status first - if it's completed, trust it
    if (analysis.analysis_status === 'completed') {
      console.log('Hook: Status is completed - returning completed');
      return 'completed';
    }
    
    // Also check for actual data content as backup
    const hasReelAnalysis = analysis.competitor_reel_analysis && 
                           typeof analysis.competitor_reel_analysis === 'object' &&
                           Object.keys(analysis.competitor_reel_analysis).length > 0;
                           
    const hasAdaptationProposal = analysis.user_adaptation_proposal && 
                                 typeof analysis.user_adaptation_proposal === 'object' &&
                                 Object.keys(analysis.user_adaptation_proposal).length > 0;
    
    console.log('Hook: Has reel analysis:', hasReelAnalysis);
    console.log('Hook: Has adaptation proposal:', hasAdaptationProposal);
    
    // If there's actual data but status is wrong, it's completed
    if (hasReelAnalysis || hasAdaptationProposal) {
      console.log('Hook: Has actual analysis data but status is wrong - returning completed');
      return 'completed';
    }
    
    // If status is pending, it's loading
    if (analysis.analysis_status === 'pending') {
      console.log('Hook: Status is pending - returning loading');
      return 'loading';
    }
    
    // Default to idle
    console.log('Hook: Defaulting to idle');
    return 'idle';
  };

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
      
      // Fetch the complete competitor data with analysis using proper join
      const { data: completeCompetitor, error: fetchError } = await supabase
        .from('competitors')
        .select(`
          *,
          competitor_videos!inner (
            *,
            competitor_analysis!competitor_analysis_competitor_video_id_fkey (*)
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
        // Ensure complete competitor has all required fields and proper analysis status
        const enhancedCompetitor = ensureCompetitorData(completeCompetitor);
        // Add analysis status to each video based on their specific analysis
        enhancedCompetitor.competitor_videos = enhancedCompetitor.competitor_videos.map(video => ({
          ...video,
          analysisStatus: getVideoAnalysisStatus(video.competitor_analysis)
        }));
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
            competitor_analysis!competitor_analysis_competitor_video_id_fkey (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure all competitors have the required fields and proper analysis status
      const enhancedCompetitors: CompetitorData[] = (data || []).map(competitor => {
        const enhancedCompetitor = ensureCompetitorData(competitor);
        // Add analysis status to each video based on their specific analysis
        enhancedCompetitor.competitor_videos = enhancedCompetitor.competitor_videos.map(video => ({
          ...video,
          analysisStatus: getVideoAnalysisStatus(video.competitor_analysis)
        }));
        return enhancedCompetitor;
      });
      
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
            competitor_analysis!competitor_analysis_competitor_video_id_fkey (*)
          )
        `)
        .eq('id', competitorId)
        .single();

      if (error) throw error;

      // Ensure refreshed competitor has all required fields and proper analysis status
      const enhancedCompetitor = ensureCompetitorData(data);
      enhancedCompetitor.competitor_videos = enhancedCompetitor.competitor_videos.map(video => ({
        ...video,
        analysisStatus: getVideoAnalysisStatus(video.competitor_analysis)
      }));

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

  const updateVideoAnalysisStatus = (videoId: string, status: 'idle' | 'loading' | 'completed' | 'error') => {
    console.log('Hook: Updating analysis status for video', videoId, 'to', status);
    setCompetitors(prev => 
      prev.map(competitor => ({
        ...competitor,
        competitor_videos: competitor.competitor_videos.map(video => 
          video.id === videoId 
            ? { ...video, analysisStatus: status }
            : video
        )
      }))
    );
  };

  // ENHANCED: Function to force refresh analysis status for all videos
  const refreshAllAnalysisStatus = async () => {
    if (!user) return;
    
    try {
      console.log('Forcing refresh of all analysis status...');
      
      // Re-fetch all competitors with fresh analysis data
      await fetchCompetitors();
      
      toast({
        title: "Estado actualizado",
        description: "Se ha actualizado el estado de todos los análisis",
      });
    } catch (error) {
      console.error('Error refreshing analysis status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de los análisis",
        variant: "destructive"
      });
    }
  };

  return {
    isLoading,
    competitors,
    scrapeCompetitor,
    fetchCompetitors,
    deleteCompetitor,
    deleteVideo,
    refreshCompetitor,
    updateVideoAnalysisStatus,
    refreshAllAnalysisStatus
  };
};

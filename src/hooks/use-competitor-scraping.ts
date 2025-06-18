import { useState, useEffect } from 'react';
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

  // SIMPLIFICADA: Función mejorada para detectar estado de análisis de forma más confiable
  const getVideoAnalysisStatus = (analysisArray: any[]): 'idle' | 'loading' | 'completed' | 'error' => {
    console.log('🔍 IMPROVED: Analyzing status for video with analysis data:', analysisArray);
    
    if (!analysisArray || analysisArray.length === 0) {
      console.log('📋 IMPROVED: No analysis found - status: IDLE');
      return 'idle';
    }
    
    const analysis = analysisArray[0];
    console.log('📊 IMPROVED: Analysis object details:', {
      id: analysis.id,
      status: analysis.analysis_status,
      hasReelAnalysis: !!(analysis.competitor_reel_analysis && Object.keys(analysis.competitor_reel_analysis).length > 0),
      hasAdaptationProposal: !!(analysis.user_adaptation_proposal && Object.keys(analysis.user_adaptation_proposal).length > 0),
      createdAt: analysis.created_at,
      updatedAt: analysis.updated_at
    });
    
    // PRIORIDAD 1: Si el status es explícitamente 'completed', confiar en él
    if (analysis.analysis_status === 'completed') {
      console.log('✅ IMPROVED: Status is explicitly completed - returning COMPLETED');
      return 'completed';
    }
    
    // PRIORIDAD 2: Verificar si hay datos reales de análisis
    const hasActualData = (
      (analysis.competitor_reel_analysis && 
       typeof analysis.competitor_reel_analysis === 'object' &&
       Object.keys(analysis.competitor_reel_analysis).length > 0) ||
      (analysis.user_adaptation_proposal && 
       typeof analysis.user_adaptation_proposal === 'object' &&
       Object.keys(analysis.user_adaptation_proposal).length > 0)
    );
    
    if (hasActualData) {
      console.log('✅ IMPROVED: Found actual analysis data - forcing COMPLETED status');
      return 'completed';
    }
    
    // PRIORIDAD 3: Si status es pending pero no hay datos, está loading
    if (analysis.analysis_status === 'pending') {
      console.log('⏳ IMPROVED: Status is pending - returning LOADING');
      return 'loading';
    }
    
    console.log('❓ IMPROVED: Defaulting to IDLE');
    return 'idle';
  };

  // MEJORADA: Función para obtener datos frescos con logging detallado
  const fetchCompetitorsWithFreshData = async () => {
    if (!user) return;

    console.log('🔄 SYNC: Starting fresh competitor data fetch...');
    
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

      if (error) {
        console.error('❌ SYNC: Error fetching competitors:', error);
        throw error;
      }
      
      console.log('📦 SYNC: Raw data received from database:', data);
      
      // Procesar y enriquecer datos con estado correcto
      const enhancedCompetitors: CompetitorData[] = (data || []).map(competitor => {
        console.log(`🏢 SYNC: Processing competitor ${competitor.instagram_username} with ${competitor.competitor_videos?.length || 0} videos`);
        
        const enhancedCompetitor = ensureCompetitorData(competitor);
        
        // Aplicar estado de análisis correcto a cada video
        enhancedCompetitor.competitor_videos = enhancedCompetitor.competitor_videos.map(video => {
          const originalStatus = video.analysisStatus;
          const newStatus = getVideoAnalysisStatus(video.competitor_analysis);
          
          console.log(`🎥 SYNC: Video ${video.id} status: ${originalStatus} → ${newStatus}`);
          
          return {
            ...video,
            analysisStatus: newStatus
          };
        });
        
        return enhancedCompetitor;
      });
      
      console.log('✅ SYNC: Successfully processed all competitors with fresh analysis statuses');
      setCompetitors(enhancedCompetitors);
      
      return enhancedCompetitors;
    } catch (error) {
      console.error('❌ SYNC: Error in fetchCompetitorsWithFreshData:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los competidores",
        variant: "destructive"
      });
      return [];
    }
  };

  // AUTOMÁTICO: Forzar refresh cuando se carga la página
  useEffect(() => {
    if (user) {
      console.log('🚀 INIT: Auto-refreshing competitors on page load...');
      fetchCompetitorsWithFreshData();
    }
  }, [user]);

  // Real-time subscription mejorada con logging
  useEffect(() => {
    if (!user) return;

    console.log('📡 REALTIME: Setting up enhanced real-time subscription...');
    
    const channel = supabase
      .channel('competitor-analysis-changes-enhanced')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'competitor_analysis'
        },
        (payload) => {
          console.log('📡 REALTIME: Analysis update received:', payload);
          
          if (payload.new && payload.new.competitor_video_id) {
            console.log(`🔔 REALTIME: Refreshing analysis for video ${payload.new.competitor_video_id}`);
            refreshAnalysisForVideo(payload.new.competitor_video_id);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 REALTIME: Cleaning up enhanced subscription...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Function to refresh analysis data for a specific video
  const refreshAnalysisForVideo = async (videoId: string) => {
    try {
      console.log('🔄 REFRESH: Refreshing analysis for video:', videoId);
      
      // Fetch updated analysis data for the specific video
      const { data: analysisData, error } = await supabase
        .from('competitor_analysis')
        .select('*')
        .eq('competitor_video_id', videoId);

      if (error) {
        console.error('❌ REFRESH: Error fetching updated analysis:', error);
        return;
      }

      console.log('📊 REFRESH: Fresh analysis data received:', analysisData);

      // Update the local state with fresh analysis data
      setCompetitors(prev => 
        prev.map(competitor => ({
          ...competitor,
          competitor_videos: competitor.competitor_videos.map(video => {
            if (video.id === videoId) {
              const newStatus = getVideoAnalysisStatus(analysisData || []);
              console.log(`🎥 REFRESH: Video ${videoId} updated with status: ${newStatus}`);
              
              return {
                ...video,
                competitor_analysis: analysisData || [],
                analysisStatus: newStatus
              };
            }
            return video;
          })
        }))
      );
    } catch (error) {
      console.error('❌ REFRESH: Error refreshing analysis for video:', error);
    }
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

      // Remove temporary competitor and refresh all data
      setCompetitors(prev => prev.filter(c => c.id !== tempCompetitor.id));
      await fetchCompetitorsWithFreshData();

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

  // RENOMBRADA: fetchCompetitors ahora usa la nueva función con datos frescos
  const fetchCompetitors = fetchCompetitorsWithFreshData;

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
    console.log('🔄 UPDATE: Manually updating analysis status for video', videoId, 'to', status);
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

  // MEJORADA: Función para forzar refresh de todos los estados de análisis
  const refreshAllAnalysisStatus = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 FORCE REFRESH: Starting complete refresh of all analysis statuses...');
      
      // Usar la función mejorada que obtiene datos frescos
      await fetchCompetitorsWithFreshData();
      
      toast({
        title: "Estado actualizado",
        description: "Se ha actualizado el estado de todos los análisis",
      });
    } catch (error) {
      console.error('❌ FORCE REFRESH: Error refreshing analysis status:', error);
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

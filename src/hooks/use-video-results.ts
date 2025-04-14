
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, AIFeedbackResponse } from '@/types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useVideoResults = (videoId?: string) => {
  const [searchParams] = useSearchParams();
  const queryVideoId = videoId || searchParams.get('videoId');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchVideo = useCallback(async () => {
    if (!queryVideoId) {
      setLoading(false);
      return;
    }
    
    if (!user) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', queryVideoId)
        .eq('user_id', user.id)
        .single();
      
      if (videoError) {
        if (videoError.code === 'PGRST116') {
          setUnauthorized(true);
          throw new Error('No tienes permiso para acceder a este video o no existe');
        }
        throw new Error(videoError.message);
      }
      
      if (!videoData) {
        setUnauthorized(true);
        throw new Error('Video no encontrado');
      }
      
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('video_id', queryVideoId)
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw new Error(feedbackError.message);
      
      const isFavorite = 'is_favorite' in videoData ? !!videoData.is_favorite : false;
      
      const finalVideo: Video = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description || '',
        status: videoData.status,
        created_at: videoData.created_at,
        video_url: videoData.video_url,
        user_id: videoData.user_id,
        thumbnail_url: videoData.thumbnail_url || '',
        is_favorite: isFavorite,
        updated_at: videoData.updated_at || videoData.created_at,
        feedback: []
      };
      
      setVideo(finalVideo);

      if (feedbackData && feedbackData.length > 0) {
        const processedFeedback: AIFeedbackResponse[] = [];
        
        for (const item of feedbackData) {
          try {
            const feedbackJson = item.feedback_data as Record<string, any> || {};
            const finalEval = feedbackJson.finalEvaluation || {};
            
            const aiResponse: AIFeedbackResponse = {
              id: item.id,
              created_at: item.created_at,
              feedback_data: feedbackJson,
              
              contentType: feedbackJson.contentTypeStrategy?.classification || "Contenido educativo",
              generalStudy: feedbackJson.executiveSummary || "Análisis del contenido del video",
              contentTitle: videoData.title,
              contentSubtitle: "Análisis de rendimiento",
              
              overallEvaluation: {
                score: finalEval.overallScore || item.overall_score || 0,
                suggestions: Array.isArray(finalEval.finalRecommendations) 
                  ? finalEval.finalRecommendations 
                  : ["Mejora la introducción", "Refuerza el mensaje principal", "Añade una llamada a la acción clara"]
              },
              
              structure: {
                hook: feedbackJson.videoStructureAndPacing?.hook ? {
                  general: feedbackJson.videoStructureAndPacing.hook.attentionGrabbingComment || "",
                  spoken: feedbackJson.videoStructureAndPacing.hook.spokenHookAnalysis || "",
                  visual: feedbackJson.videoStructureAndPacing.hook.visualHookAnalysis || "",
                  strengths: feedbackJson.videoStructureAndPacing.hook.strengths || "",
                  weaknesses: feedbackJson.videoStructureAndPacing.hook.weaknesses || "",
                  score: feedbackJson.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
                  auditory: feedbackJson.videoStructureAndPacing.hook.auditoryHookAnalysis || "",
                  clarity: feedbackJson.videoStructureAndPacing.hook.clarityAndSimplicityComment || "",
                  feel: feedbackJson.videoStructureAndPacing.hook.authenticityFeelComment || "",
                  invitation: feedbackJson.videoStructureAndPacing.hook.viewerBenefitCommunicationComment || "",
                  patternBreak: feedbackJson.videoStructureAndPacing.hook.patternDisruptionComment || ""
                } : undefined,
                buildUp: feedbackJson.videoStructureAndPacing?.buildUpAndPacingComment || "",
                value: feedbackJson.videoStructureAndPacing?.valueDelivery ? {
                  comment: feedbackJson.videoStructureAndPacing.valueDelivery.comment || "",
                  score: feedbackJson.videoStructureAndPacing.valueDelivery.qualityScore || 0,
                  function: feedbackJson.videoStructureAndPacing.valueDelivery.mainFunction || ""
                } : undefined,
                cta: feedbackJson.videoStructureAndPacing?.ctaAndEnding?.comment || ""
              },
              
              seo: {
                keywordAnalysis: feedbackJson.seoAndDiscoverability?.keywordIdentificationComment || "",
                clarity: feedbackJson.seoAndDiscoverability?.thematicClarityComment || "",
                suggestedText: feedbackJson.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "",
                suggestedCopy: feedbackJson.seoAndDiscoverability?.suggestedOptimizedCopy || "",
                trucoFlow: feedbackJson.seoAndDiscoverability?.trucoFlow || ""
              },
              
              nativeCodes: feedbackJson.platformNativeElements?.integrationEffectivenessComment || "",
              
              engagementPotential: {
                interaction: feedbackJson.engagementOptimization?.interactionHierarchyComment || "",
                watchTime: feedbackJson.engagementOptimization?.watchTimePotentialComment || ""
              }
            };
            
            processedFeedback.push(aiResponse);
          } catch (parseError) {
            console.error('Error parsing feedback data:', parseError);
          }
        }
        
        if (processedFeedback.length > 0) {
          setFeedback(processedFeedback);
        }
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setLoading(false);
    }
  }, [queryVideoId, user]);

  const toggleFavorite = async () => {
    if (!video || !user) return;
    
    try {
      const newFavoriteStatus = !video.is_favorite;
      
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setVideo({
        ...video,
        is_favorite: newFavoriteStatus
      });
      
    } catch (err) {
      console.error('Error updating favorite status:', err);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  useEffect(() => {
    if (unauthorized) {
      navigate('/history', { 
        replace: true,
        state: { 
          error: 'No tienes permiso para acceder a este video o no existe'
        }
      });
    }
  }, [unauthorized, navigate]);

  const videoData = video;
  const hasFeedback = feedback && feedback.length > 0;

  return { 
    video, 
    videoData,
    feedback,
    hasFeedback,
    toggleFavorite,
    loading, 
    error,
    unauthorized
  };
};


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, AIFeedbackResponse } from '@/types';
import { useSearchParams } from 'react-router-dom';

export const useVideoResults = (videoId?: string) => {
  const [searchParams] = useSearchParams();
  const queryVideoId = videoId || searchParams.get('videoId');
  
  const [video, setVideo] = useState<Video | null>(null);
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!queryVideoId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the video data
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', queryVideoId)
        .single();
      
      if (videoError) throw new Error(videoError.message);
      if (!videoData) throw new Error('Video not found');
      
      // Get feedback data from the feedback table
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('video_id', queryVideoId)
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw new Error(feedbackError.message);
      
      // Create the final video object with proper typings
      // Handle is_favorite explicitly since it might not be in the database schema
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
        feedback: [] // Will be populated with actual feedback data
      };
      
      setVideo(finalVideo);

      // Process feedback data if available
      if (feedbackData && feedbackData.length > 0) {
        // Array to store processed feedback responses
        const processedFeedback: AIFeedbackResponse[] = [];
        
        for (const item of feedbackData) {
          try {
            // Safely cast the feedback_data to an object
            const feedbackJson = item.feedback_data as Record<string, any> || {};
            const finalEval = feedbackJson.finalEvaluation || {};
            
            // Create an AIFeedbackResponse using the actual data from the database
            const aiResponse: AIFeedbackResponse = {
              id: item.id,
              created_at: item.created_at,
              feedback_data: feedbackJson,
              
              // Set compatibility fields for existing components
              contentType: feedbackJson.contentTypeStrategy?.classification || "Contenido educativo",
              generalStudy: feedbackJson.executiveSummary || "Análisis del contenido del video",
              contentTitle: videoData.title,
              contentSubtitle: "Análisis de rendimiento",
              
              // Calculate overall evaluation scores and suggestions
              overallEvaluation: {
                score: item.overall_score || finalEval.overallScore || 0,
                suggestions: Array.isArray(finalEval.finalRecommendations) 
                  ? finalEval.finalRecommendations 
                  : ["Mejora la introducción", "Refuerza el mensaje principal", "Añade una llamada a la acción clara"]
              },
              
              // Map structure data
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
              
              // Map SEO data
              seo: {
                keywordAnalysis: feedbackJson.seoAndDiscoverability?.keywordIdentificationComment || "",
                clarity: feedbackJson.seoAndDiscoverability?.thematicClarityComment || "",
                suggestedText: feedbackJson.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "",
                suggestedCopy: feedbackJson.seoAndDiscoverability?.suggestedOptimizedCopy || ""
              },
              
              // Map native codes data
              nativeCodes: feedbackJson.platformNativeElements?.integrationEffectivenessComment || "",
              
              // Map engagement potential data
              engagementPotential: {
                interaction: feedbackJson.engagementOptimization?.interactionHierarchyComment || "",
                watchTime: feedbackJson.engagementOptimization?.watchTimePotentialComment || ""
              }
            };
            
            processedFeedback.push(aiResponse);
          } catch (parseError) {
            console.error('Error parsing feedback data:', parseError);
            // Continue to next feedback item if there's an error
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
  }, [queryVideoId]);

  const toggleFavorite = async () => {
    if (!video) return;
    
    try {
      const newFavoriteStatus = !video.is_favorite;
      
      // Update is_favorite in Supabase
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);
        
      if (error) throw error;
      
      // Update local state
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

  const videoData = video;
  const hasFeedback = feedback && feedback.length > 0;

  return { 
    video, 
    videoData,
    feedback,
    hasFeedback,
    toggleFavorite,
    loading, 
    error 
  };
};

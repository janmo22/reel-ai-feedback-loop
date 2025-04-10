
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
            const feedbackJson = item.feedback_data as Record<string, any>;
            
            if (!feedbackJson) continue;
            
            // Create an AIFeedbackResponse using the actual data from the database
            const aiResponse: AIFeedbackResponse = {
              id: item.id,
              feedback: typeof feedbackJson.feedback === 'string' ? feedbackJson.feedback : "Análisis completo del vídeo",
              score: item.overall_score || 0,
              suggestions: typeof feedbackJson.suggestions === 'string' ? feedbackJson.suggestions : "",
              tags: Array.isArray(feedbackJson.tags) ? feedbackJson.tags : ["reel", "instagram", "contenido"],
              created_at: item.created_at,
              generalStudy: typeof feedbackJson.generalStudy === 'string' ? feedbackJson.generalStudy : "Análisis del contenido del video",
              contentType: typeof feedbackJson.contentType === 'string' ? feedbackJson.contentType : "Reel informativo",
              contentTitle: typeof feedbackJson.contentTitle === 'string' ? feedbackJson.contentTitle : videoData.title,
              contentSubtitle: typeof feedbackJson.contentSubtitle === 'string' ? feedbackJson.contentSubtitle : "Análisis de contenido",
              overallEvaluation: {
                score: item.overall_score || 0,
                suggestions: Array.isArray(feedbackJson.overallEvaluation?.suggestions) ? 
                  feedbackJson.overallEvaluation.suggestions : 
                  typeof feedbackJson.suggestions === 'string' ? 
                    [feedbackJson.suggestions] : 
                    ["Mejora la introducción", "Refuerza el mensaje principal", "Añade una llamada a la acción clara"]
              },
              structure: typeof feedbackJson.structure === 'object' && feedbackJson.structure ? {
                hook: typeof feedbackJson.structure.hook === 'object' && feedbackJson.structure.hook ? {
                  general: typeof feedbackJson.structure.hook.general === 'string' ? feedbackJson.structure.hook.general : "Información no disponible",
                  spoken: typeof feedbackJson.structure.hook.spoken === 'string' ? feedbackJson.structure.hook.spoken : "Información no disponible",
                  visual: typeof feedbackJson.structure.hook.visual === 'string' ? feedbackJson.structure.hook.visual : "Información no disponible",
                  strengths: typeof feedbackJson.structure.hook.strengths === 'string' ? feedbackJson.structure.hook.strengths : "Información no disponible",
                  weaknesses: typeof feedbackJson.structure.hook.weaknesses === 'string' ? feedbackJson.structure.hook.weaknesses : "Información no disponible",
                  score: typeof feedbackJson.structure.hook.score === 'number' ? feedbackJson.structure.hook.score : 0,
                  auditory: typeof feedbackJson.structure.hook.auditory === 'string' ? feedbackJson.structure.hook.auditory : "Información no disponible",
                  clarity: typeof feedbackJson.structure.hook.clarity === 'string' ? feedbackJson.structure.hook.clarity : "Información no disponible",
                  feel: typeof feedbackJson.structure.hook.feel === 'string' ? feedbackJson.structure.hook.feel : "Información no disponible",
                  invitation: typeof feedbackJson.structure.hook.invitation === 'string' ? feedbackJson.structure.hook.invitation : "Información no disponible",
                  patternBreak: typeof feedbackJson.structure.hook.patternBreak === 'string' ? feedbackJson.structure.hook.patternBreak : "Información no disponible"
                } : {
                  general: "Información no disponible",
                  spoken: "Información no disponible",
                  visual: "Información no disponible",
                  strengths: "Información no disponible",
                  weaknesses: "Información no disponible",
                  score: 0,
                  auditory: "Información no disponible",
                  clarity: "Información no disponible",
                  feel: "Información no disponible",
                  invitation: "Información no disponible",
                  patternBreak: "Información no disponible"
                },
                buildUp: typeof feedbackJson.structure.buildUp === 'string' ? feedbackJson.structure.buildUp : "Información no disponible",
                value: typeof feedbackJson.structure.value === 'object' && feedbackJson.structure.value ? {
                  comment: typeof feedbackJson.structure.value.comment === 'string' ? feedbackJson.structure.value.comment : "Información no disponible",
                  score: typeof feedbackJson.structure.value.score === 'number' ? feedbackJson.structure.value.score : 0,
                  function: typeof feedbackJson.structure.value.function === 'string' ? feedbackJson.structure.value.function : "Información no disponible"
                } : {
                  comment: "Información no disponible",
                  score: 0,
                  function: "Información no disponible"
                },
                cta: typeof feedbackJson.structure.cta === 'string' ? feedbackJson.structure.cta : "Información no disponible"
              } : {
                hook: {
                  general: "Información no disponible",
                  spoken: "Información no disponible", 
                  visual: "Información no disponible",
                  strengths: "Información no disponible",
                  weaknesses: "Información no disponible",
                  score: 0,
                  auditory: "Información no disponible",
                  clarity: "Información no disponible",
                  feel: "Información no disponible",
                  invitation: "Información no disponible",
                  patternBreak: "Información no disponible"
                },
                buildUp: "Información no disponible",
                value: {
                  comment: "Información no disponible",
                  score: 0,
                  function: "Información no disponible"
                },
                cta: "Información no disponible"
              },
              seo: typeof feedbackJson.seo === 'object' && feedbackJson.seo ? {
                keywordAnalysis: typeof feedbackJson.seo.keywordAnalysis === 'string' ? feedbackJson.seo.keywordAnalysis : "Información no disponible",
                clarity: typeof feedbackJson.seo.clarity === 'string' ? feedbackJson.seo.clarity : "Información no disponible",
                suggestedText: typeof feedbackJson.seo.suggestedText === 'string' ? feedbackJson.seo.suggestedText : "Información no disponible",
                suggestedCopy: typeof feedbackJson.seo.suggestedCopy === 'string' ? feedbackJson.seo.suggestedCopy : "Información no disponible"
              } : {
                keywordAnalysis: "Información no disponible",
                clarity: "Información no disponible",
                suggestedText: "Información no disponible",
                suggestedCopy: "Información no disponible"
              },
              nativeCodes: typeof feedbackJson.nativeCodes === 'string' ? feedbackJson.nativeCodes : "Información no disponible",
              engagementPotential: typeof feedbackJson.engagementPotential === 'object' && feedbackJson.engagementPotential ? {
                interaction: typeof feedbackJson.engagementPotential.interaction === 'string' ? feedbackJson.engagementPotential.interaction : "Información no disponible",
                watchTime: typeof feedbackJson.engagementPotential.watchTime === 'string' ? feedbackJson.engagementPotential.watchTime : "Información no disponible"
              } : {
                interaction: "Información no disponible",
                watchTime: "Información no disponible"
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

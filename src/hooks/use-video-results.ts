
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
          // Extract the feedback_data JSON from the database
          const feedbackJson = item.feedback_data;
          
          if (!feedbackJson) continue;
          
          // Create an AIFeedbackResponse using the actual data from the database
          const aiResponse: AIFeedbackResponse = {
            id: item.id,
            feedback: feedbackJson.feedback || "Análisis completo del vídeo",
            score: item.overall_score || 0,
            suggestions: feedbackJson.suggestions || "",
            tags: feedbackJson.tags || ["reel", "instagram", "contenido"],
            created_at: item.created_at,
            generalStudy: feedbackJson.generalStudy || "Análisis del contenido del video",
            contentType: feedbackJson.contentType || "Reel informativo",
            contentTitle: feedbackJson.contentTitle || videoData.title,
            contentSubtitle: feedbackJson.contentSubtitle || "Análisis de contenido",
            overallEvaluation: {
              score: item.overall_score || 0,
              suggestions: feedbackJson.suggestions ? 
                (Array.isArray(feedbackJson.suggestions) ? 
                  feedbackJson.suggestions : 
                  [feedbackJson.suggestions]) : 
                ["Mejora la introducción", "Refuerza el mensaje principal", "Añade una llamada a la acción clara"]
            },
            structure: feedbackJson.structure || {
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
            seo: feedbackJson.seo || {
              keywordAnalysis: "Información no disponible",
              clarity: "Información no disponible",
              suggestedText: "Información no disponible",
              suggestedCopy: "Información no disponible"
            },
            nativeCodes: feedbackJson.nativeCodes || "Información no disponible",
            engagementPotential: feedbackJson.engagementPotential || {
              interaction: "Información no disponible",
              watchTime: "Información no disponible"
            }
          };
          
          processedFeedback.push(aiResponse);
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

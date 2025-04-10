
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Video, AIFeedbackResponse } from '@/types';
import { useSearchParams } from 'react-router-dom';

export const useVideoResults = (videoId?: string) => {
  const supabase = useSupabaseClient();
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
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', queryVideoId)
        .single();
      
      if (videoError) throw new Error(videoError.message);
      if (!videoData) throw new Error('Video not found');
      
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('video_feedback')
        .select('*')
        .eq('video_id', queryVideoId)
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw new Error(feedbackError.message);
      
      const finalVideo: Video = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        status: videoData.status,
        created_at: videoData.created_at,
        video_url: videoData.video_url,
        user_id: videoData.user_id,
        thumbnail_url: videoData.thumbnail_url || '',
        is_favorite: videoData.is_favorite || false,
        updated_at: videoData.updated_at,
        feedback: feedbackData || []
      };
      
      setVideo(finalVideo);

      // Mock feedback data for now - this would typically come from another API call
      // or be part of the feedback data from Supabase
      if (feedbackData && feedbackData.length > 0) {
        const mockFeedbackResponse: AIFeedbackResponse = {
          id: feedbackData[0].id,
          feedback: "Análisis completo del vídeo",
          score: feedbackData[0].overall_score || 7,
          suggestions: "Mejorar el inicio del video para captar más atención",
          tags: ["reel", "instagram", "contenido"],
          created_at: feedbackData[0].created_at,
          generalStudy: "Tu reel tiene potencial pero necesita ajustes para maximizar su impacto",
          contentType: "Reel informativo",
          contentTitle: videoData.title,
          contentSubtitle: "Análisis de contenido",
          overallEvaluation: {
            score: feedbackData[0].overall_score || 7,
            suggestions: [
              "Mejora la introducción para captar más rápido la atención",
              "Refuerza el mensaje principal para mayor claridad",
              "Añade una llamada a la acción más específica"
            ]
          },
          structure: {
            hook: {
              general: "El hook inicial podría ser más impactante",
              spoken: "La narración es clara pero necesita más energía",
              visual: "Los elementos visuales son adecuados",
              strengths: "Buena claridad en la comunicación",
              weaknesses: "Falta de impacto emocional inicial",
              score: 6,
              auditory: "El audio es de buena calidad",
              clarity: "El mensaje es comprensible",
              feel: "La atmósfera es profesional",
              invitation: "Podría mejorar la invitación inicial",
              patternBreak: "Falta un patrón disruptivo para captar atención"
            },
            buildUp: "El desarrollo del contenido es coherente pero podría ser más dinámico",
            value: {
              comment: "El valor principal se comunica adecuadamente",
              score: 7,
              function: "Informativa y educativa"
            },
            cta: "La llamada a la acción podría ser más específica"
          },
          seo: {
            keywordAnalysis: "Buen uso de palabras clave relevantes",
            clarity: "La temática principal es clara para el algoritmo",
            suggestedText: "Mejora tu presencia digital",
            suggestedCopy: "¿Quieres que tus reels generen más engagement? Aplica estas técnicas probadas para multiplicar tu alcance y conversión. #ContentStrategy #ReelsTips"
          },
          nativeCodes: "Incorpora hashtags más específicos y relevantes para tu nicho",
          engagementPotential: {
            interaction: "Tiene potencial para generar comentarios",
            watchTime: "La duración es adecuada para mantener la atención"
          }
        };
        
        setFeedback([mockFeedbackResponse]);
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setLoading(false);
    }
  }, [queryVideoId, supabase]);

  const toggleFavorite = async () => {
    if (!video) return;
    
    try {
      const newFavoriteStatus = !video.is_favorite;
      
      const { error } = await supabase
        .from('videos')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', video.id);
        
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

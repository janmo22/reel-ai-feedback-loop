
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIFeedbackResponse, Video } from "@/types";

export function useVideoResults() {
  const location = useLocation();
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<Video | null>(null);
  const { toast } = useToast();
  
  const toggleFavorite = async () => {
    if (!videoData?.id) return;
    
    try {
      const newFavoriteStatus = !videoData.is_favorite;
      
      // Actualizar en la base de datos
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', videoData.id);
      
      if (error) throw error;
      
      // Actualizar el estado local
      setVideoData(prev => {
        if (!prev) return null;
        return { ...prev, is_favorite: newFavoriteStatus };
      });
      
      toast({
        title: newFavoriteStatus 
          ? "Análisis guardado en favoritos" 
          : "Análisis eliminado de favoritos",
        description: newFavoriteStatus 
          ? "Puedes encontrarlo en tu dashboard" 
          : "Ya no aparecerá en tu lista de favoritos",
      });
      
    } catch (error) {
      console.error("Error al cambiar estado de favorito:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el análisis en favoritos",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    // Check if we have data from the state
    const state = location.state;
    
    if (state && state.feedback) {
      // If we already have feedback in the state, use it directly
      setFeedback(state.feedback as AIFeedbackResponse[]);
      setVideoData(state.videoData as Video);
      setLoading(false);
      console.log("Using feedback data from state:", state.feedback);
    } else if (state && state.videoId) {
      // Si solo tenemos el videoId, buscamos los datos en la base de datos
      const fetchData = async () => {
        try {
          // Obtenemos los datos del video
          const { data: videoData, error: videoError } = await supabase
            .from('videos')
            .select('*')
            .eq('id', state.videoId)
            .maybeSingle();
          
          if (videoError) {
            console.error("Error obteniendo datos del video:", videoError);
            setLoading(true);
            return;
          }
          
          if (!videoData) {
            console.error("No se encontraron datos para el video:", state.videoId);
            setLoading(true);
            return;
          }
          
          console.log("Video data obtenido:", videoData);
          
          // Transform data to match our Video interface
          const transformedVideoData: Video = {
            id: videoData.id,
            created_at: videoData.created_at,
            title: videoData.title,
            description: videoData.description,
            status: videoData.status as 'processing' | 'completed' | 'failed',
            url: videoData.video_url || null, // Use video_url as url if needed
            video_url: videoData.video_url,
            user_id: videoData.user_id,
            thumbnail_url: videoData.thumbnail_url,
            is_favorite: videoData.is_favorite || false,
            updated_at: videoData.updated_at
          };
          
          setVideoData(transformedVideoData);
          
          // Comprobamos si hay feedback existente
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('feedback')
            .select('*')
            .eq('video_id', state.videoId)
            .maybeSingle();
          
          if (feedbackError) {
            console.error("Error al verificar feedback existente:", feedbackError);
          } else if (feedbackData) {
            // Si ya existe feedback, lo procesamos
            try {
              // Handle both array and single object cases
              const feedbackContent = Array.isArray(feedbackData.feedback_data) 
                ? feedbackData.feedback_data 
                : [feedbackData.feedback_data];
                
              setFeedback(feedbackContent as unknown as AIFeedbackResponse[]);
              setLoading(false);
              
              // Update video status to completed if needed
              if (transformedVideoData.status !== 'completed') {
                await supabase
                  .from('videos')
                  .update({ 
                    status: 'completed'
                  })
                  .eq('id', state.videoId);
              }
              
              console.log("Feedback encontrado para el video:", feedbackContent);
              
              toast({
                title: "¡Análisis completado!",
                description: "Los resultados de tu video ya están listos para revisar.",
              });
            } catch (parseError) {
              console.error("Error parsing feedback data:", parseError);
              setLoading(true);
            }
          } else {
            // No hay feedback, seguimos en estado de carga pero mostramos el video
            console.log("No hay feedback aún para el video. Estado:", transformedVideoData.status);
            setLoading(true);
          }
        } catch (error) {
          console.error("Error obteniendo datos:", error);
          setLoading(true);
        }
      };
      
      fetchData();

      // Hacemos polling cada pocos segundos si el video aún se está procesando
      const intervalId = setInterval(fetchData, 10000); // Verificamos cada 10 segundos
      
      // Subscribe to Supabase Realtime for feedback updates
      console.log("Suscribiéndose a actualizaciones en tiempo real para el video:", state.videoId);
      
      const channel = supabase
        .channel(`public:feedback:video_id=eq.${state.videoId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'feedback',
            filter: `video_id=eq.${state.videoId}`
          },
          async (payload) => {
            console.log("Realtime update received for feedback:", payload);
            
            // Fetch the complete feedback data
            const { data: newFeedback, error: feedbackError } = await supabase
              .from('feedback')
              .select('*')
              .eq('id', payload.new.id)
              .maybeSingle();
              
            if (feedbackError || !newFeedback) {
              console.error("Error fetching feedback data after realtime update:", feedbackError);
              return;
            }
            
            try {
              const feedbackContent = Array.isArray(newFeedback.feedback_data) 
                ? newFeedback.feedback_data 
                : [newFeedback.feedback_data];
              
              const formattedFeedback = feedbackContent as unknown as AIFeedbackResponse[];
              setFeedback(formattedFeedback);
              setLoading(false);
              
              // Update video status to completed
              await supabase
                .from('videos')
                .update({ 
                  status: 'completed'
                })
                .eq('id', state.videoId);
              
              toast({
                title: "¡Análisis completado!",
                description: "Los resultados de tu video ya están listos para revisar.",
              });
            } catch (parseError) {
              console.error("Error processing realtime feedback data:", parseError);
            }
          }
        )
        .subscribe((status) => {
          console.log("Supabase Realtime subscription status:", status);
        });
      
      return () => {
        clearInterval(intervalId); // Limpiamos al desmontar el componente
        supabase.removeChannel(channel); // Unsubscribe from realtime updates
      };
    } else {
      // Si no tenemos datos en el state, mantenemos el estado de carga
      setLoading(true);
    }
  }, [location, toast]);

  return {
    feedback,
    videoData,
    loading,
    hasFeedback: feedback && feedback.length > 0,
    toggleFavorite
  };
}

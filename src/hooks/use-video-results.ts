
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
  
  useEffect(() => {
    // Check if we have data from the state
    const state = location.state;
    
    if (state && state.feedback) {
      // If we already have feedback in the state, use it directly
      setFeedback(state.feedback as AIFeedbackResponse[]);
      setVideoData(state.videoData);
      setLoading(false);
      console.log("Using feedback data from state:", state.feedback);
    } else if (state && state.videoId) {
      // Si solo tenemos el videoId, buscamos los datos en la base de datos
      const fetchVideoData = async () => {
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
          setVideoData(videoData as Video);
          
          // Comprobamos el estado del video
          // Check if status is completed or if the feedback_received field is true
          const videoTyped = videoData as Video;
          const feedbackReceived = 
            videoTyped.feedback_received === true || 
            videoData.status === "completed";
          
          if (feedbackReceived) {
            // Buscamos feedback asociado
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('feedback')
              .select('*')
              .eq('video_id', state.videoId)
              .maybeSingle();
            
            if (feedbackError) {
              console.error("Error obteniendo feedback:", feedbackError);
              setLoading(true);
            } else if (feedbackData) {
              // Cast the feedback_data to AIFeedbackResponse with proper type handling
              let formattedFeedback: AIFeedbackResponse[];
              
              if (feedbackData.feedback_data) {
                try {
                  // Handle both array and single object cases with proper type assertion
                  const feedbackContent = Array.isArray(feedbackData.feedback_data) 
                    ? feedbackData.feedback_data 
                    : [feedbackData.feedback_data];
                    
                  // Type assertion to ensure it matches AIFeedbackResponse structure
                  formattedFeedback = feedbackContent as unknown as AIFeedbackResponse[];
                  
                  setFeedback(formattedFeedback);
                  setLoading(false);
                  console.log("Feedback data obtenido de DB:", formattedFeedback);
                  
                  // Mostramos toast cuando el feedback está listo
                  toast({
                    title: "¡Análisis completado!",
                    description: "Los resultados de tu video ya están listos para revisar.",
                  });
                } catch (parseError) {
                  console.error("Error parsing feedback data:", parseError);
                  setLoading(false);
                }
              } else {
                console.log("No feedback_data found in the response");
                setLoading(false);
              }
            } else {
              // No se encontró feedback
              console.log("No se encontró feedback para el video:", state.videoId);
              setLoading(true);
            }
          } else {
            // El video aún está procesándose
            setLoading(true);
            console.log("El video aún está en procesamiento. Estado actual:", videoData.status);
          }
        } catch (error) {
          console.error("Error obteniendo datos:", error);
          setLoading(true);
        }
      };
      
      fetchVideoData();

      // Hacemos polling cada pocos segundos si el video aún se está procesando
      const intervalId = setInterval(fetchVideoData, 10000); // Verificamos cada 10 segundos
      
      // Subscribe to Supabase Realtime for feedback updates
      const channel = supabase
        .channel(`feedback-${state.videoId}`)
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
                  status: 'completed', 
                  feedback_received: true 
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
        .subscribe();
      
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
    hasFeedback: feedback && feedback.length > 0
  };
}

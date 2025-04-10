
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIFeedbackResponse } from "@/types";

export function useVideoResults() {
  const location = useLocation();
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<any>(null);
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
          setVideoData(videoData);
          
          // Comprobamos el estado del video
          if (videoData.status === "completed" || videoData.feedback_received === true) {
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
              // Convertimos los datos de feedback al formato esperado
              const formattedFeedback = 
                Array.isArray(feedbackData.feedback_data) 
                  ? feedbackData.feedback_data 
                  : [feedbackData.feedback_data] as AIFeedbackResponse[];
                  
              setFeedback(formattedFeedback);
              setLoading(false);
              console.log("Feedback data obtenido de DB:", formattedFeedback);
              
              // Mostramos toast cuando el feedback está listo
              toast({
                title: "¡Análisis completado!",
                description: "Los resultados de tu video ya están listos para revisar.",
              });
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
      
      return () => {
        clearInterval(intervalId); // Limpiamos al desmontar el componente
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

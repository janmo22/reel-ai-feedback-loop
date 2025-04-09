
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
      // If we only have the videoId, try to get the data from the database
      const fetchVideoData = async () => {
        try {
          // Get the video data
          const { data: videoData, error: videoError } = await supabase
            .from('videos')
            .select('*')
            .eq('id', state.videoId)
            .single();
          
          if (videoError) {
            console.error("Error getting video data:", videoError);
            setLoading(true);
            return;
          }
          
          setVideoData(videoData);
          
          // Check if the video is completed
          if (videoData.status === "completed") {
            // Look for associated feedback
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('feedback')
              .select('*')
              .eq('video_id', state.videoId)
              .single();
            
            if (feedbackError) {
              console.error("Error getting feedback:", feedbackError);
              // Don't throw error, just keep loading as true
              setLoading(true);
            } else if (feedbackData) {
              // Convert feedback data to the expected format with proper type casting
              const formattedFeedback = feedbackData.feedback_data as unknown as AIFeedbackResponse[];
              setFeedback(formattedFeedback);
              setLoading(false);
              console.log("Feedback data obtained from DB:", formattedFeedback);
              
              // Show a toast when the feedback is ready
              toast({
                title: "¡Análisis completado!",
                description: "Los resultados de tu video ya están listos para revisar.",
              });
            } else {
              // No feedback found but don't show an error
              setLoading(true);
            }
          } else {
            // The video is still processing - this is expected in some cases
            setLoading(true);
            console.log("El video aún está en procesamiento. Estado actual:", videoData.status);
          }
        } catch (error) {
          console.error("Error getting data:", error);
          setLoading(true);
          // Don't show toast error for loading state
        }
      };
      
      fetchVideoData();

      // Poll for updates every few seconds if the video is still processing
      const intervalId = setInterval(fetchVideoData, 10000); // Check every 10 seconds
      
      return () => {
        clearInterval(intervalId); // Clean up on component unmount
      };
    } else {
      // If we don't have data in the state, keep loading state
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

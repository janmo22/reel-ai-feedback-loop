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
          
          if (videoError) throw videoError;
          
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
              // Don't show error, just keep loading as true
            } else if (feedbackData) {
              // Convert feedback data to the expected format
              const formattedFeedback = feedbackData.feedback_data as AIFeedbackResponse[];
              setFeedback(formattedFeedback);
              setLoading(false);
              console.log("Feedback data obtained from DB:", formattedFeedback);
            }
          } else {
            // The video is still processing
            setLoading(true);
            toast({
              title: "Video en procesamiento",
              description: "El análisis de este video aún está en proceso. Por favor, intenta más tarde.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error getting data:", error);
          setLoading(true);
        }
      };
      
      fetchVideoData();
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

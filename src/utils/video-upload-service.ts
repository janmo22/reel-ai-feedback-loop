
import { supabase } from "@/integrations/supabase/client";
import { VideoUploadResponse } from "@/types";

export interface UploadVideoParams {
  videoId: string;
  userId: string;
  videoFile: File;
  title: string;
  description: string;
  missions: string[];
  mainMessage: string;
}

// The webhook URL for uploading videos (updated to production webhook)
export const WEBHOOK_URL = "https://hazloconflow.app.n8n.cloud/webhook/69fef48e-0c7e-4130-b420-eea7347e1dab";

/**
 * Save the initial video metadata to Supabase
 */
export async function saveVideoMetadata(
  videoId: string,
  userId: string, 
  title: string, 
  description: string,
  missions: string[] = [],
  mainMessage: string = ""
) {
  console.log("Guardando metadatos en Supabase...");
  
  try {
    await supabase
      .from('videos')
      .insert([
        {
          id: videoId,
          user_id: userId,
          title,
          description,
          video_url: "placeholder-url", // URL placeholder since we're not uploading the video to Supabase
          status: 'processing',
          missions,
          main_message: mainMessage
        }
      ]);
    
    console.log("Metadatos guardados en Supabase correctamente");
  } catch (dbError) {
    console.error("Error guardando en Supabase:", dbError);
    throw new Error(`Error guardando metadatos: ${dbError}`);
  }
}

/**
 * Update the video status in Supabase
 */
export async function updateVideoStatus(videoId: string, status: string) {
  try {
    await supabase
      .from('videos')
      .update({ status })
      .eq('id', videoId);
    
    console.log(`Estado del video ${videoId} actualizado a ${status} en Supabase`);
    return true;
  } catch (updateError) {
    console.error("Error actualizando estado:", updateError);
    return false;
  }
}

/**
 * Upload the video to the webhook - with improved handling for no-cors mode
 */
export async function uploadVideoToWebhook({
  videoId,
  userId,
  videoFile,
  title,
  description,
  missions,
  mainMessage
}: UploadVideoParams): Promise<VideoUploadResponse> {
  console.log("Enviando datos al webhook:", WEBHOOK_URL);
  
  // Create a FormData object and add all the data
  const formData = new FormData();
  formData.append("videoId", videoId);
  formData.append("userId", userId);
  formData.append("title", title);
  formData.append("description", description || "");
  formData.append("missions", JSON.stringify(missions));
  formData.append("mainMessage", mainMessage);
  
  // Add the video file to FormData
  formData.append("video", videoFile);
  
  console.log("Enviando datos y video en binario al webhook");
  
  try {
    // Save all metadata to Supabase including missions and main message
    await saveVideoMetadata(videoId, userId, title, description, missions, mainMessage);
    
    try {
      // Using regular fetch mode first to try to get a response
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        console.log("Datos enviados correctamente al webhook con respuesta");
        return { 
          status: "success", 
          videoId,
          message: "Video enviado para procesamiento. Revisa los resultados más tarde."
        };
      }
      
      console.warn("La respuesta del webhook no fue exitosa, usando modo no-cors como respaldo");
    } catch (fetchError) {
      console.warn("Error al intentar fetch con modo normal:", fetchError);
    }
    
    // Fallback to no-cors mode
    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors", // Fallback to no-cors mode
    });
    
    console.log("Datos enviados al webhook usando modo no-cors");
    
    return { 
      status: "processing", 
      videoId,
      message: "Video enviado para procesamiento. Revisa los resultados más tarde."
    };
  } catch (error) {
    // Even with no-cors, network errors can still be caught
    console.error("Error en la conexión con el webhook", error);
    
    // Instead of failing, we return a success response with a processing status
    // The user will wait for the webhook to complete processing
    return { 
      status: "processing", 
      videoId,
      message: "Video enviado para procesamiento. La conexión puede haber fallado pero el análisis continuará en segundo plano."
    };
  }
}

/**
 * Create a feedback entry in Supabase
 */
export async function saveFeedbackResponse(videoId: string, feedbackData: any, overallScore: number = 0) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          video_id: videoId,
          feedback_data: feedbackData,
          overall_score: overallScore,
          webhook_response: feedbackData,
          processing_completed_at: new Date().toISOString()
        }
      ]);
      
    if (error) {
      console.error("Error al guardar el feedback:", error);
      return false;
    }
    
    console.log("Feedback guardado correctamente para el video:", videoId);
    return true;
  } catch (error) {
    console.error("Error al guardar el feedback:", error);
    return false;
  }
}

/**
 * Check if a video has feedback
 */
export async function checkVideoFeedback(videoId: string) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('video_id', videoId)
      .maybeSingle();
    
    if (error) {
      console.error("Error al verificar feedback:", error);
      return false;
    }
    
    return !!data; // Return true if feedback exists
  } catch (error) {
    console.error("Error al verificar feedback:", error);
    return false;
  }
}

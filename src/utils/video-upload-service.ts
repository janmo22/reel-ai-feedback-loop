
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
 * Create a new video record in Supabase
 */
export async function createVideoRecord(userId: string, title: string, description: string, missions: string[], mainMessage: string) {
  try {
    console.log("Creando registro de video en Supabase...");
    
    // Remove missions from the direct insertion since the column doesn't exist
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert([
        {
          title,
          description,
          user_id: userId,
          video_url: "placeholder-url", // Will be updated later
          status: 'processing', // Changed from 'uploading' to 'processing' to match valid status values
          // missions field is removed from here
        }
      ])
      .select()
      .single();
    
    if (videoError) {
      console.error("Error creando registro de video:", videoError);
      throw new Error(`Error al crear registro de video: ${videoError.message}`);
    }
    
    if (!videoData || !videoData.id) {
      throw new Error("No se pudo obtener el ID del video creado");
    }
    
    console.log("Video registrado en Supabase con ID:", videoData.id);
    return videoData;
  } catch (error) {
    console.error("Error creando registro de video:", error);
    throw error;
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
  
  console.log("Enviando datos y video en binario al webhook con videoId:", videoId);
  
  try {
    // Update video status to processing before sending to webhook
    await updateVideoStatus(videoId, 'processing');
    
    // Using regular fetch mode first to try to get a response
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });
    
    if (response.ok) {
      console.log("Datos enviados correctamente al webhook con respuesta");
      
      return { 
        status: "processing", 
        videoId,
        message: "Video enviado para procesamiento. Revisa los resultados más tarde."
      };
    }
    
    console.warn("La respuesta del webhook no fue exitosa, usando modo no-cors como respaldo");
    throw new Error("La respuesta del webhook no fue exitosa");
  } catch (fetchError) {
    console.warn("Error al intentar fetch con modo normal:", fetchError);
    
    try {
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
    } catch (noCorsError) {
      console.error("Error en ambos métodos de envío:", noCorsError);
      
      // Update video status to error
      await updateVideoStatus(videoId, 'error');
      
      throw new Error(`Error al enviar el video: ${noCorsError.message}`);
    }
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


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

// The webhook URL for uploading videos
export const WEBHOOK_URL = "https://hazloconflow.app.n8n.cloud/webhook/69fef48e-0c7e-4130-b420-eea7347e1dab";

/**
 * Save the initial video metadata to Supabase
 */
export async function saveVideoMetadata(
  videoId: string,
  userId: string, 
  title: string, 
  description: string
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
          status: 'processing'
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
 * Upload the video to the webhook
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
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors", // Important to avoid CORS errors
    });
    
    console.log("Datos enviados al webhook", response);
    
    // Since we can't get the actual response with no-cors, simulate a success response
    return { status: "success", videoId };
  } catch (error) {
    console.error("Error en la conexión con el webhook", error);
    throw new Error(`Error en la conexión con el webhook: ${error}`);
  }
}

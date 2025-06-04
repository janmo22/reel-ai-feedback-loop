
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

// Updated webhook URL to Railway production endpoint
export const WEBHOOK_URL = "https://primary-production-9b33.up.railway.app/webhook-test/69fef48e-0c7e-4130-b420-eea7347e1dab";

/**
 * Fetch user mission data from the database
 */
export async function fetchUserMissionData(userId: string) {
  try {
    console.log("Fetching user mission data for user:", userId);
    
    const { data, error } = await supabase
      .from('user_mission')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user mission data:", error);
      return null;
    }
    
    console.log("User mission data retrieved:", data);
    return data;
  } catch (error) {
    console.error("Error fetching user mission data:", error);
    return null;
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
 * Create a new video record in Supabase
 */
export async function createVideoRecord(userId: string, title: string, description: string, missions: string[], mainMessage: string) {
  try {
    console.log("Creando registro de video en Supabase...");
    
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .insert([
        {
          title,
          description,
          user_id: userId,
          video_url: "processing", // Temporal mientras se procesa
          status: 'processing',
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
 * Upload the video to the webhook - Railway production endpoint
 */
export const uploadVideoToWebhook = async (params: {
  videoId: string;
  userId: string;
  videoFile: File;
  title: string;
  description: string;
  missions: string[];
  mainMessage: string;
}): Promise<VideoUploadResponse> => {
  console.log("Enviando datos al webhook de Railway:", WEBHOOK_URL);
  
  // Get MIME type from the file
  const mimeType = params.videoFile.type;
  console.log(`Tipo de archivo (MIME Type): ${mimeType}`);
  console.log(`Tamaño del archivo: ${params.videoFile.size} bytes`);
  console.log(`Nombre del archivo: ${params.videoFile.name}`);
  
  // Fetch user mission data if available
  const userMissionData = await fetchUserMissionData(params.userId);
  
  // Create a FormData object and add all the data
  const formData = new FormData();
  formData.append("videoId", params.videoId);
  formData.append("userId", params.userId);
  formData.append("title", params.title);
  formData.append("description", params.description || "");
  formData.append("missions", JSON.stringify(params.missions));
  formData.append("mainMessage", params.mainMessage);
  formData.append("mimeType", mimeType);
  
  // Add user mission data if available
  if (userMissionData) {
    formData.append("userMissionData", JSON.stringify(userMissionData));
    
    console.log("Enviando datos de estrategia del usuario con el video:", {
      valueProposition: userMissionData.value_proposition,
      mission: userMissionData.mission,
      niche: userMissionData.niche,
      targetAudience: userMissionData.target_audience,
      contentStrategy: {
        character: userMissionData.content_character,
        personality: userMissionData.content_personality,
        tone: userMissionData.content_tone
      }
    });
  } else {
    console.log("No se encontraron datos de estrategia para este usuario");
  }
  
  // Add the video file to FormData - CLAVE: usar el nombre correcto del campo
  formData.append("video", params.videoFile, params.videoFile.name);
  
  console.log(`Enviando video: Nombre=${params.videoFile.name}, Tamaño=${params.videoFile.size} bytes, Tipo=${mimeType}`);
  console.log("FormData preparado con los siguientes campos:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`- ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else {
      console.log(`- ${key}: ${typeof value === 'string' ? value.substring(0, 100) : value}`);
    }
  }
  
  try {
    // Update video status to processing before sending to webhook
    await updateVideoStatus(params.videoId, 'processing');
    
    console.log("Enviando petición al webhook de Railway...");
    
    // Send to Railway webhook with timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      headers: {
        // No establecer Content-Type manualmente cuando usamos FormData
        // El browser lo hace automáticamente con el boundary correcto
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Respuesta del webhook: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log("Datos enviados correctamente al webhook de Railway");
      
      let responseText = '';
      try {
        responseText = await response.text();
        console.log("Respuesta del webhook:", responseText);
      } catch (textError) {
        console.log("No se pudo leer la respuesta del webhook, pero el status es OK");
      }
      
      return { 
        status: "processing", 
        videoId: params.videoId,
        message: "Video enviado para procesamiento. Revisa los resultados más tarde."
      };
    } else {
      // Leer el error del webhook si está disponible
      let errorText = '';
      try {
        errorText = await response.text();
        console.error("Error del webhook:", errorText);
      } catch (textError) {
        console.error("No se pudo leer el error del webhook");
      }
      
      console.error("Error en la respuesta del webhook:", response.status, response.statusText);
      
      // Update video status to error
      await updateVideoStatus(params.videoId, 'error');
      
      throw new Error(`Error del webhook (${response.status}): ${errorText || response.statusText}`);
    }
  } catch (fetchError) {
    console.error("Error al enviar al webhook:", fetchError);
    
    // Update video status to error
    await updateVideoStatus(params.videoId, 'error');
    
    if (fetchError.name === 'AbortError') {
      throw new Error("Timeout: El webhook tardó demasiado en responder. Inténtalo de nuevo.");
    }
    
    throw new Error(`Error al enviar el video: ${fetchError.message}`);
  }
};

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

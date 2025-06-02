
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
          video_url: "processing", // Placeholder URL during processing
          status: 'processing',
          feedback_received: false
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
 * Upload video for analysis using the new Edge Function
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
  console.log("Enviando video para análisis con Edge Function...");
  
  try {
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
    formData.append("mimeType", params.videoFile.type);
    
    // Add user mission data if available
    if (userMissionData) {
      formData.append("userMissionData", JSON.stringify(userMissionData));
      console.log("Enviando datos de estrategia del usuario con el video");
    } else {
      console.log("No se encontraron datos de estrategia para este usuario");
    }
    
    // Add the video file to FormData
    formData.append("video", params.videoFile);
    
    console.log(`Enviando video para análisis: Nombre=${params.videoFile.name}, Tamaño=${params.videoFile.size} bytes, Tipo=${params.videoFile.type}`);
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('process-video-analysis', {
      body: formData
    });
    
    if (error) {
      console.error("Error calling Edge Function:", error);
      await updateVideoStatus(params.videoId, 'error');
      throw new Error(`Error al procesar el video: ${error.message}`);
    }
    
    if (data && data.success) {
      console.log("Video enviado para análisis exitosamente:", data);
      return { 
        success: true,
        videoId: params.videoId,
        message: data.message || "Video enviado para análisis. El procesamiento puede tardar algunos minutos.",
        status: "processing"
      };
    } else {
      console.error("Error en la respuesta del Edge Function:", data);
      await updateVideoStatus(params.videoId, 'error');
      throw new Error(data?.error || "Error desconocido en el procesamiento");
    }
    
  } catch (error: any) {
    console.error("Error en el proceso de análisis:", error);
    await updateVideoStatus(params.videoId, 'error');
    throw new Error(`Error al procesar el video: ${error.message}`);
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

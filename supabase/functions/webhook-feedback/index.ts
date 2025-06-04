
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos para las respuestas del webhook de Railway
interface WebhookResponseItem {
  videoId: string;
  userId: string;
  executiveSummary?: string;
  strategicAlignment?: any;
  videoStructureAndPacing?: any;
  platformNativeElements?: any;
  engagementOptimization?: any;
  seoAndDiscoverability?: any;
  contentTypeStrategy?: any;
  finalEvaluation?: {
    overallScore?: number;
    finalRecommendations?: string[];
  };
  // Backwards compatibility with old format
  generalStudy?: string;
  contentType?: string;
  overallEvaluation?: {
    score?: number;
    suggestions?: string[];
  };
}

// Procesamiento de las respuestas del webhook
serve(async (req) => {
  console.log("Recibiendo respuesta del webhook de Railway");
  
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers, status: 200 });
  }
  
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers, status: 405 }
    );
  }
  
  try {
    // Obtener los datos del cuerpo de la solicitud
    const requestData = await req.json();
    console.log("Datos recibidos del webhook de Railway:", requestData);
    
    // Verificar que la respuesta es un array como se espera
    if (!Array.isArray(requestData)) {
      console.error("La respuesta del webhook no es un array:", requestData);
      return new Response(
        JSON.stringify({ error: "Invalid data format, expected array" }),
        { headers, status: 400 }
      );
    }
    
    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Procesar cada elemento del array
    for (const item of requestData) {
      const { videoId, userId } = item;
      
      // Verificar que tenemos los campos necesarios
      if (!videoId || !userId) {
        console.error("Elemento sin videoId o userId:", item);
        continue;
      }
      
      // Verificar si ya existe un feedback para este video
      const { data: existingFeedback, error: checkError } = await supabase
        .from("feedback")
        .select("id")
        .eq("video_id", videoId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error al verificar si existe feedback previo:", checkError);
      }
      
      // Get overall score from multiple possible sources
      const overallScore = item.finalEvaluation?.overallScore || 
                           item.overallEvaluation?.score || 
                           0;
                           
      console.log(`Score calculado para video ${videoId}: ${overallScore}`);
      
      // Si ya existe feedback, actualizamos en lugar de insertar
      if (existingFeedback) {
        console.log(`Ya existe feedback para el video ${videoId}, actualizando...`);
        
        const { error: updateError } = await supabase
          .from("feedback")
          .update({
            overall_score: overallScore,
            feedback_data: item,
          })
          .eq("id", existingFeedback.id);
          
        if (updateError) {
          console.error(`Error al actualizar feedback para video ${videoId}:`, updateError);
        } else {
          console.log(`Feedback actualizado correctamente para el video ${videoId}`);
        }
      } else {
        // Guardar los datos de feedback en la tabla de feedback
        const { error: feedbackError } = await supabase
          .from("feedback")
          .insert({
            video_id: videoId,
            overall_score: overallScore,
            feedback_data: item,
          });
          
        if (feedbackError) {
          console.error("Error al guardar feedback para video " + videoId + ":", feedbackError);
        } else {
          console.log("Feedback guardado correctamente para el video:", videoId);
        }
      }
      
      // Actualizar el estado del video a "completed"
      const { error: videoError } = await supabase
        .from("videos")
        .update({
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", videoId);
        
      if (videoError) {
        console.error("Error al actualizar video " + videoId + ":", videoError);
      } else {
        console.log("Video actualizado correctamente:", videoId);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback procesado correctamente",
        count: requestData.length 
      }),
      { headers, status: 200 }
    );
    
  } catch (error) {
    console.error("Error al procesar la respuesta del webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers, status: 500 }
    );
  }
});

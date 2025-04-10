
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos para las respuestas del webhook
interface WebhookResponseItem {
  videoId: string;
  userId: string;
  generalStudy: string;
  contentType: string;
  engagementPotential: {
    interaction: string;
    watchTime: string;
  };
  nativeCodes: string;
  overallEvaluation: {
    score: number;
    suggestions: string[];
  };
  seo: {
    keywordAnalysis: string;
    suggestedCopy: string;
    suggestedText: string;
    clarity: string;
  };
  structure?: {
    hook?: {
      general: string;
      spoken: string;
      auditory: string;
      visual: string;
      clarity: string;
      feel: string;
      invitation: string;
      patternBreak: string;
      strengths: string;
      weaknesses: string;
      score: number;
    };
    buildUp?: string;
    value?: {
      comment: string;
      score: number;
      function: string;
    };
    cta?: string;
  };
}

// Procesamiento de las respuestas del webhook
serve(async (req) => {
  console.log("Recibiendo respuesta del webhook");
  
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
    console.log("Datos recibidos del webhook:", requestData);
    
    // Verificar que la respuesta es un array como se espera
    if (!Array.isArray(requestData)) {
      console.error("La respuesta del webhook no es un array:", requestData);
      return new Response(
        JSON.stringify({ error: "Invalid data format, expected array" }),
        { headers, status: 400 }
      );
    }
    
    // Procesar cada elemento del array
    for (const item of requestData) {
      const { videoId, userId } = item;
      
      // Verificar que tenemos los campos necesarios
      if (!videoId || !userId) {
        console.error("Elemento sin videoId o userId:", item);
        continue; // Skip this item and process the next one
      }
      
      // Crear cliente de Supabase
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Guardar los datos de feedback en la tabla de feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .insert({
          video_id: videoId,
          overall_score: item.overallEvaluation?.score || 0,
          feedback_data: item,
          webhook_response: requestData,
          processing_completed_at: new Date().toISOString(),
        });
        
      if (feedbackError) {
        console.error("Error al guardar feedback para video " + videoId + ":", feedbackError);
      } else {
        console.log("Feedback guardado correctamente para el video:", videoId);
      }
      
      // Actualizar el estado del video a "completed"
      const { error: videoError } = await supabase
        .from("videos")
        .update({
          status: "completed",
          feedback_received: true,
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

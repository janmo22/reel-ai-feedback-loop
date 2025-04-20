
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
  // Add support for flat structure
  executiveSummary?: string;
  finalEvaluation_overallScore?: number;
  finalEvaluation_finalRecommendations?: string[];
  strategicAlignment_targetAudienceClarityComment?: string;
  strategicAlignment_valuePropositionClarityComment?: string;
  strategicAlignment_creatorConsistencyComment?: string;
  strategicAlignment_recommendations?: string;
  contentTypeStrategy_classification?: string;
  contentTypeStrategy_recommendations?: string;
  // ... and all other flat properties
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
        continue; // Skip this item and process the next one
      }
      
      // Verificar si ya existe un feedback para este video para evitar duplicados
      const { data: existingFeedback, error: checkError } = await supabase
        .from("feedback")
        .select("id")
        .eq("video_id", videoId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error al verificar si existe feedback previo:", checkError);
      }
      
      // Get overall score from any available source
      const overallScore = item.finalEvaluation_overallScore || 
                           item.overallEvaluation?.score || 
                           (item.feedback_data?.finalEvaluation?.overallScore) || 0;
                           
      console.log(`Score calculado para video ${videoId}: ${overallScore}`);
      
      // Si ya existe feedback, actualizamos en lugar de insertar
      if (existingFeedback) {
        console.log(`Ya existe feedback para el video ${videoId}, actualizando...`);
        
        const { data: updateData, error: updateError } = await supabase
          .from("feedback")
          .update({
            overall_score: overallScore,
            feedback_data: item,
            webhook_response: requestData,
            processing_completed_at: new Date().toISOString(),
          })
          .eq("id", existingFeedback.id)
          .select();
          
        if (updateError) {
          console.error(`Error al actualizar feedback para video ${videoId}:`, updateError);
        } else {
          console.log(`Feedback actualizado correctamente para el video ${videoId}`);
        }
      } else {
        // Guardar los datos de feedback en la tabla de feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .insert({
            video_id: videoId,
            overall_score: overallScore,
            feedback_data: item,
            webhook_response: requestData,
            processing_completed_at: new Date().toISOString(),
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
          feedback_received: true,
          is_favorite: false, // Set explicit default value for is_favorite
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

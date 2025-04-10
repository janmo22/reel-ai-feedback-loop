
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos para las respuestas del webhook
interface WebhookResponse {
  videoId: string;
  userId: string;
  feedback: FeedbackData;
}

interface FeedbackData {
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
    
    // Verificar que tenemos los campos necesarios
    const { videoId, userId, feedback } = requestData;
    
    if (!videoId || !userId || !feedback) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers, status: 400 }
      );
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
        overall_score: feedback.overallEvaluation?.score || 0,
        feedback_data: feedback,
        webhook_response: requestData,
        processing_completed_at: new Date().toISOString(),
      });
      
    if (feedbackError) {
      console.error("Error al guardar feedback:", feedbackError);
      return new Response(
        JSON.stringify({ error: "Error saving feedback", details: feedbackError }),
        { headers, status: 500 }
      );
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
      console.error("Error al actualizar video:", videoError);
      return new Response(
        JSON.stringify({ error: "Error updating video status", details: videoError }),
        { headers, status: 500 }
      );
    }
    
    console.log("Feedback guardado correctamente para el video:", videoId);
    
    return new Response(
      JSON.stringify({ success: true, message: "Feedback saved successfully" }),
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

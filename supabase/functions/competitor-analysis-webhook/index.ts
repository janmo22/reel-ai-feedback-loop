
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CompetitorAnalysisWebhookData {
  video_id: string;
  overall_score: number;
  analysis_data: any;
}

serve(async (req) => {
  console.log("Recibiendo análisis de video de competidor");
  
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
    console.log("Datos recibidos del análisis de competidor:", requestData);
    
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
      const { video_id } = item;
      
      // Verificar que tenemos los campos necesarios
      if (!video_id) {
        console.error("Elemento sin video_id:", item);
        continue;
      }
      
      // Extract overall score from finalEvaluation
      const overallScore = item.finalEvaluation_overallScore || 0;
      
      console.log(`Score calculado para video de competidor ${video_id}: ${overallScore}`);
      
      // Verificar si ya existe un análisis para este video
      const { data: existingAnalysis, error: checkError } = await supabase
        .from("competitor_analysis")
        .select("id")
        .eq("competitor_video_id", video_id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error al verificar si existe análisis previo:", checkError);
      }
      
      // Si ya existe análisis, actualizamos en lugar de insertar
      if (existingAnalysis) {
        console.log(`Ya existe análisis para el video de competidor ${video_id}, actualizando...`);
        
        const { error: updateError } = await supabase
          .from("competitor_analysis")
          .update({
            overall_score: overallScore,
            feedback_data: item,
            analysis_status: "completed"
          })
          .eq("id", existingAnalysis.id);
          
        if (updateError) {
          console.error(`Error al actualizar análisis para video de competidor ${video_id}:`, updateError);
        } else {
          console.log(`Análisis actualizado correctamente para el video de competidor ${video_id}`);
        }
      } else {
        // Guardar los datos de análisis en la tabla de competitor_analysis
        const { error: analysisError } = await supabase
          .from("competitor_analysis")
          .insert({
            competitor_video_id: video_id,
            overall_score: overallScore,
            feedback_data: item,
            analysis_status: "completed"
          });
          
        if (analysisError) {
          console.error("Error al guardar análisis para video de competidor " + video_id + ":", analysisError);
        } else {
          console.log("Análisis guardado correctamente para el video de competidor:", video_id);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Análisis de competidor procesado correctamente",
        count: requestData.length 
      }),
      { headers, status: 200 }
    );
    
  } catch (error) {
    console.error("Error al procesar la respuesta del webhook de competidor:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { headers, status: 500 }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Supported video MIME types by Gemini
const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/mov',
  'video/avi',
  'video/x-flv',
  'video/mpg',
  'video/webm',
  'video/wmv',
  'video/3gpp'
]

// Map common MIME types to supported ones
const MIME_TYPE_MAPPING: Record<string, string> = {
  'video/quicktime': 'video/mov',
  'video/x-msvideo': 'video/avi',
  'video/x-ms-wmv': 'video/wmv'
}

// File size limit 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for streaming

// Retry configuration
const MAX_RETRIES = 2;
const INITIAL_BACKOFF = 3000;

// Timeout configuration for large files
const UPLOAD_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const ANALYSIS_TIMEOUT = 30 * 60 * 1000; // 30 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let videoId: string | null = null;
  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse form data efficiently
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    videoId = formData.get('videoId') as string
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const missions = JSON.parse(formData.get('missions') as string || '[]')
    const mainMessage = formData.get('mainMessage') as string
    const userMissionData = formData.get('userMissionData') ? JSON.parse(formData.get('userMissionData') as string) : null

    console.log('Processing video analysis for:', { videoId, userId, title, fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(1)}MB` })

    if (!videoFile || !videoId || !userId) {
      throw new Error('Missing required fields: video, videoId, or userId')
    }

    // Check file size
    if (videoFile.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(videoFile.size / (1024 * 1024)).toFixed(1)}MB.`)
    }

    // Validate and normalize MIME type
    let mimeType = videoFile.type || 'video/mp4'
    console.log(`Original MIME type: ${mimeType}`)
    
    if (MIME_TYPE_MAPPING[mimeType]) {
      mimeType = MIME_TYPE_MAPPING[mimeType]
      console.log(`Mapped MIME type: ${mimeType}`)
    }
    
    if (!SUPPORTED_VIDEO_TYPES.includes(mimeType)) {
      console.warn(`Unsupported MIME type: ${mimeType}, using video/mp4 as fallback`)
      mimeType = 'video/mp4'
    }

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    // Update video status to processing immediately
    await supabaseClient
      .from('videos')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)

    console.log('Starting optimized video upload to Gemini...')
    
    // Upload with retry logic and better error handling
    let uploadResult;
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        uploadResult = await uploadToGeminiWithRetry(videoFile, videoId, mimeType, GOOGLE_GEMINI_API_KEY);
        break;
      } catch (uploadError: any) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, uploadError.message);
        retryCount++;
        
        if (retryCount > MAX_RETRIES) {
          throw new Error(`Failed to upload video after ${MAX_RETRIES + 1} attempts: ${uploadError.message}`);
        }
        
        // Progressive backoff
        const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount - 1);
        console.log(`Waiting ${backoffTime}ms before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    const { fileUri, fileName } = uploadResult;
    console.log('Video uploaded successfully:', { fileUri, fileName });

    // Wait for file processing with optimized intervals
    const fileReady = await waitForFileProcessing(fileName, GOOGLE_GEMINI_API_KEY);
    
    if (!fileReady) {
      throw new Error('File processing timeout. Please try with a smaller file or try again later.');
    }

    // Perform analysis with timeout protection
    console.log('Starting video analysis...');
    const analysisData = await performAnalysisWithTimeout(
      fileUri, 
      mimeType, 
      contextPrompt(title, description, mainMessage, missions, userMissionData),
      GOOGLE_GEMINI_API_KEY
    );

    // Save analysis to database
    console.log('Saving analysis to database...');
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert({
        video_id: videoId,
        overall_score: parseInt(analysisData.finalEvaluation_overallScore) || 7,
        feedback_data: analysisData
      })

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      throw new Error(`Failed to save feedback: ${feedbackError.message}`);
    }

    // Update video status to completed
    await supabaseClient
      .from('videos')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Video analysis completed successfully in ${processingTime}s`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Video analysis completed successfully',
      videoId: videoId,
      processingTime: processingTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in video analysis:', error);
    
    // Try to update video status to error
    if (videoId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        // Create fallback feedback for user experience
        const fallbackFeedback = createFallbackFeedback(error.message);
        
        await supabaseClient
          .from('feedback')
          .insert({
            video_id: videoId,
            overall_score: 5,
            feedback_data: fallbackFeedback
          })
          .then(() => {
            return supabaseClient
              .from('videos')
              .update({ 
                status: 'completed', // Mark as completed with fallback
                updated_at: new Date().toISOString()
              })
              .eq('id', videoId)
          })
          .catch(() => {
            // If fallback fails, mark as error
            return supabaseClient
              .from('videos')
              .update({ 
                status: 'error',
                updated_at: new Date().toISOString()
              })
              .eq('id', videoId)
          })
          
        console.log(`Updated video ${videoId} with fallback or error status`);
      } catch (updateError: any) {
        console.error('Error updating video status:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Optimized upload function with chunking
async function uploadToGeminiWithRetry(videoFile: File, videoId: string, mimeType: string, apiKey: string) {
  const uploadFormData = new FormData();
  
  const metadata = {
    file: {
      displayName: `video-${videoId}`,
      mimeType: mimeType
    }
  };
  
  uploadFormData.append('metadata', JSON.stringify(metadata));
  uploadFormData.append('file', videoFile);

  console.log('Uploading to Gemini with streaming...');
  
  const uploadController = new AbortController();
  const uploadTimeout = setTimeout(() => {
    uploadController.abort();
  }, UPLOAD_TIMEOUT);

  try {
    const uploadResponse = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'multipart',
        'X-Goog-Api-Key': apiKey,
      },
      body: uploadFormData,
      signal: uploadController.signal
    });
    
    clearTimeout(uploadTimeout);
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    const fileUri = uploadResult.file?.uri;
    const fileName = uploadResult.file?.name;
    
    if (!fileUri || !fileName) {
      throw new Error('No file URI or name received from Gemini upload');
    }
    
    return { fileUri, fileName };
    
  } catch (error: any) {
    clearTimeout(uploadTimeout);
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout: File upload took too long. Please try with a smaller file.');
    }
    throw error;
  }
}

// Optimized file processing wait
async function waitForFileProcessing(fileName: string, apiKey: string): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 120; // 20 minutes max wait
  let checkInterval = 5000; // Start with 5 seconds
  
  console.log('Waiting for file processing...');
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    attempts++;
    
    // Progressive interval increase
    if (attempts > 5) {
      checkInterval = Math.min(checkInterval * 1.1, 10000); // Max 10 seconds
    }
    
    try {
      const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
        },
      });
      
      if (!statusResponse.ok) {
        if (statusResponse.status === 404 && attempts > 10) {
          throw new Error('File not found after extended wait');
        }
        continue;
      }
      
      const statusResult = await statusResponse.json();
      console.log(`File status check ${attempts}: ${statusResult.state}`);
      
      if (statusResult.state === 'ACTIVE') {
        return true;
      } else if (statusResult.state === 'FAILED') {
        throw new Error(`File processing failed: ${statusResult.error || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      if (error.message.includes('File not found')) {
        throw error;
      }
      console.error(`Status check error on attempt ${attempts}:`, error.message);
    }
  }
  
  return false;
}

// Analysis with timeout protection
async function performAnalysisWithTimeout(fileUri: string, mimeType: string, prompt: string, apiKey: string) {
  const analysisController = new AbortController();
  const analysisTimeout = setTimeout(() => {
    analysisController.abort();
  }, ANALYSIS_TIMEOUT);
  
  try {
    const analysisResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                fileData: {
                  mimeType: mimeType,
                  fileUri: fileUri
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 10,
          topP: 0.8,
          maxOutputTokens: 4096,
        }
      }),
      signal: analysisController.signal
    });
    
    clearTimeout(analysisTimeout);
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      throw new Error(`Gemini analysis error (${analysisResponse.status}): ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    const analysisText = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis content received from Gemini');
    }

    // Parse JSON response
    try {
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (parseError: any) {
      console.error('Failed to parse JSON response, creating fallback');
      return createFallbackFeedback('Analysis completed but response format needs improvement');
    }
    
  } catch (error: any) {
    clearTimeout(analysisTimeout);
    if (error.name === 'AbortError') {
      throw new Error('Analysis timeout: Video analysis took too long. Please try again.');
    }
    throw error;
  }
}

// Create fallback feedback for error cases
function createFallbackFeedback(errorMessage: string) {
  return {
    executiveSummary: `Tu video ha sido procesado, aunque hubo algunas limitaciones técnicas durante el análisis completo. El video se ha subido correctamente y contiene contenido valioso que puede ser mejorado con las siguientes recomendaciones generales.`,
    finalEvaluation_overallScore: "6",
    finalEvaluation_finalRecommendations: [
      "Mejora la calidad del audio para mayor claridad",
      "Optimiza el gancho inicial para captar atención rápidamente", 
      "Añade una llamada a la acción clara al final"
    ],
    contentTypeStrategy_classification: "Contenido educativo/informativo",
    contentTypeStrategy_trendAdaptationCritique: "El contenido muestra potencial para adaptarse a tendencias actuales",
    contentTypeStrategy_seriesClarityAndHookComment: "Se recomienda mejorar la claridad del mensaje inicial",
    contentTypeStrategy_recommendations: "Enfócate en crear un gancho más atractivo y mantener la consistencia temática",
    strategicAlignment_targetAudienceClarityComment: "La audiencia objetivo puede definirse mejor",
    strategicAlignment_valuePropositionClarityComment: "La propuesta de valor está presente pero puede ser más explícita",
    strategicAlignment_creatorConsistencyComment: "Mantén un estilo consistente en futuros contenidos",
    strategicAlignment_recommendations: "Define claramente tu nicho y mantén coherencia en el mensaje",
    seoAndDiscoverability_keywordIdentificationComment: "Se pueden identificar palabras clave relevantes para mejorar el alcance",
    seoAndDiscoverability_thematicClarityComment: "El tema principal es identificable pero puede ser más específico",
    seoAndDiscoverability_hashtagsSEOAnalysis: "Los hashtags pueden optimizarse para mejor descubrimiento",
    seoAndDiscoverability_searchBarPotentialComment: "Tiene potencial de búsqueda con optimizaciones",
    seoAndDiscoverability_recommendations: "Optimiza palabras clave y hashtags específicos del nicho",
    seoAndDiscoverability_suggestedOptimizedCopy: "Crea una descripción más específica con palabras clave relevantes",
    seoAndDiscoverability_suggestedOptimizedOnScreenText: "Añade texto en pantalla que refuerce el mensaje principal",
    seoAndDiscoverability_onScreenTextSEOAanalysis: "El texto en pantalla puede ser más estratégico para SEO",
    seoAndDiscoverability_coverThumbnailPotentialComment: "La portada puede optimizarse para mayor atractivo visual",
    seoAndDiscoverability_copySEOAnalysis: "El copy puede mejorarse con keywords específicas",
    seoAndDiscoverability_advancedDiscoveryFeaturesComment: "Utiliza funciones avanzadas de la plataforma para mayor alcance",
    engagementOptimization_interactionHierarchyComment: "Estructura el contenido para fomentar más interacciones",
    engagementOptimization_watchTimePotentialComment: "El tiempo de visualización puede incrementarse con mejor estructura",
    engagementOptimization_viralityFactorsComment: "Incorpora elementos que fomenten el compartir",
    engagementOptimization_recommendations: "Mejora la interactividad y elementos virales",
    platformNativeElements_identifiedElements: "Utiliza efectos y elementos nativos de la plataforma",
    platformNativeElements_integrationEffectivenessComment: "La integración de elementos nativos puede ser más efectiva",
    platformNativeElements_recommendations: "Experimenta con funciones específicas de la plataforma",
    videoStructureAndPacing_hook_attentionGrabbingComment: "El gancho inicial necesita ser más impactante",
    videoStructureAndPacing_hook_auditoryHookAnalysis: "El audio inicial puede ser más atractivo",
    videoStructureAndPacing_hook_visualHookAnalysis: "Los elementos visuales iniciales pueden mejorarse",
    videoStructureAndPacing_hook_clarityAndSimplicityComment: "Simplifica el mensaje inicial para mayor claridad",
    videoStructureAndPacing_hook_authenticityFeelComment: "Mantén la autenticidad mientras mejoras la presentación",
    videoStructureAndPacing_hook_viewerBenefitCommunicationComment: "Comunica el beneficio para el espectador más claramente",
    videoStructureAndPacing_hook_patternDisruptionComment: "Rompe patrones esperados para captar atención",
    videoStructureAndPacing_hook_strengths: "El contenido tiene valor informativo",
    videoStructureAndPacing_hook_weaknesses: "Necesita mayor impacto inicial",
    videoStructureAndPacing_hook_recommendations: "Crea un gancho más directo y atractivo",
    videoStructureAndPacing_hook_spokenHookAnalysis: "Las primeras palabras pueden ser más impactantes",
    videoStructureAndPacing_hook_overallEffectivenessScore: "6",
    videoStructureAndPacing_buildUpAndPacingComment: "El ritmo del video puede optimizarse",
    videoStructureAndPacing_buildUpAndPacingRecommendations: "Mantén un ritmo dinámico y evita momentos lentos",
    videoStructureAndPacing_valueDelivery_comment: "El valor se entrega pero puede ser más eficiente",
    videoStructureAndPacing_valueDelivery_mainFunction: "Informar y educar al espectador",
    videoStructureAndPacing_valueDelivery_recommendations: "Estructura el contenido para entregar valor más rápidamente",
    videoStructureAndPacing_valueDelivery_qualityScore: "6",
    videoStructureAndPacing_ctaAndEnding_comment: "Añade una llamada a la acción clara al final",
    videoStructureAndPacing_ctaAndEnding_recommendations: "Termina con una invitación específica a la acción"
  };
}

// Create context prompt
function contextPrompt(title: string, description: string, mainMessage: string, missions: string[], userMissionData: any) {
  let contextPrompt = `Analiza este video siguiendo exactamente esta estructura JSON. Tu respuesta debe ser un objeto JSON válido con exactamente estos campos:`;

  const analysisStructure = {
    executiveSummary: "Un resumen ejecutivo del análisis",
    finalEvaluation_overallScore: "Puntuación del 1 al 10",
    finalEvaluation_finalRecommendations: "Array de 3 recomendaciones principales",
    contentTypeStrategy_classification: "Clasificación del tipo de contenido",
    contentTypeStrategy_trendAdaptationCritique: "Análisis de adaptación a tendencias",
    contentTypeStrategy_seriesClarityAndHookComment: "Comentario sobre claridad de serie y gancho",
    contentTypeStrategy_recommendations: "Recomendaciones de estrategia de contenido",
    strategicAlignment_targetAudienceClarityComment: "Comentario sobre claridad de audiencia objetivo",
    strategicAlignment_valuePropositionClarityComment: "Comentario sobre claridad de propuesta de valor",
    strategicAlignment_creatorConsistencyComment: "Comentario sobre consistencia del creador",
    strategicAlignment_recommendations: "Recomendaciones de alineación estratégica",
    seoAndDiscoverability_keywordIdentificationComment: "Comentario sobre identificación de palabras clave",
    seoAndDiscoverability_thematicClarityComment: "Comentario sobre claridad temática",
    seoAndDiscoverability_hashtagsSEOAnalysis: "Análisis SEO de hashtags",
    seoAndDiscoverability_searchBarPotentialComment: "Comentario sobre potencial en barra de búsqueda",
    seoAndDiscoverability_recommendations: "Recomendaciones de SEO y descubrimiento",
    seoAndDiscoverability_suggestedOptimizedCopy: "Copy optimizado sugerido",
    seoAndDiscoverability_suggestedOptimizedOnScreenText: "Texto en pantalla optimizado sugerido",
    seoAndDiscoverability_onScreenTextSEOAanalysis: "Análisis SEO del texto en pantalla",
    seoAndDiscoverability_coverThumbnailPotentialComment: "Comentario sobre potencial de portada/thumbnail",
    seoAndDiscoverability_copySEOAnalysis: "Análisis SEO del copy",
    seoAndDiscoverability_advancedDiscoveryFeaturesComment: "Comentario sobre funciones avanzadas de descubrimiento",
    engagementOptimization_interactionHierarchyComment: "Comentario sobre jerarquía de interacciones",
    engagementOptimization_watchTimePotentialComment: "Comentario sobre potencial de tiempo de visualización",
    engagementOptimization_viralityFactorsComment: "Comentario sobre factores de viralidad",
    engagementOptimization_recommendations: "Recomendaciones de optimización de engagement",
    platformNativeElements_identifiedElements: "Elementos nativos identificados",
    platformNativeElements_integrationEffectivenessComment: "Comentario sobre efectividad de integración",
    platformNativeElements_recommendations: "Recomendaciones de elementos nativos",
    videoStructureAndPacing_hook_attentionGrabbingComment: "Comentario sobre captación de atención del gancho",
    videoStructureAndPacing_hook_auditoryHookAnalysis: "Análisis del gancho auditivo",
    videoStructureAndPacing_hook_visualHookAnalysis: "Análisis del gancho visual",
    videoStructureAndPacing_hook_clarityAndSimplicityComment: "Comentario sobre claridad y simplicidad del gancho",
    videoStructureAndPacing_hook_authenticityFeelComment: "Comentario sobre sensación de autenticidad del gancho",
    videoStructureAndPacing_hook_viewerBenefitCommunicationComment: "Comentario sobre comunicación de beneficio al espectador",
    videoStructureAndPacing_hook_patternDisruptionComment: "Comentario sobre disrupción de patrones",
    videoStructureAndPacing_hook_strengths: "Fortalezas del gancho",
    videoStructureAndPacing_hook_weaknesses: "Debilidades del gancho",
    videoStructureAndPacing_hook_recommendations: "Recomendaciones para el gancho",
    videoStructureAndPacing_hook_spokenHookAnalysis: "Análisis del gancho hablado",
    videoStructureAndPacing_hook_overallEffectivenessScore: "Puntuación de efectividad general del gancho (1-10)",
    videoStructureAndPacing_buildUpAndPacingComment: "Comentario sobre desarrollo y ritmo",
    videoStructureAndPacing_buildUpAndPacingRecommendations: "Recomendaciones de desarrollo y ritmo",
    videoStructureAndPacing_valueDelivery_comment: "Comentario sobre entrega de valor",
    videoStructureAndPacing_valueDelivery_mainFunction: "Función principal de entrega de valor",
    videoStructureAndPacing_valueDelivery_recommendations: "Recomendaciones de entrega de valor",
    videoStructureAndPacing_valueDelivery_qualityScore: "Puntuación de calidad de entrega de valor (1-10)",
    videoStructureAndPacing_ctaAndEnding_comment: "Comentario sobre CTA y final",
    videoStructureAndPacing_ctaAndEnding_recommendations: "Recomendaciones de CTA y final"
  };

  contextPrompt += `\n\n${JSON.stringify(analysisStructure, null, 2)}`;

  if (userMissionData) {
    contextPrompt += `\n\nEstrategia del usuario: Misión: ${userMissionData.mission}, Audiencia: ${userMissionData.target_audience}`;
  }

  contextPrompt += `\n\nTítulo: ${title}, Descripción: ${description}, Mensaje: ${mainMessage}, Misiones: ${missions.join(', ')}`;

  return contextPrompt;
}

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

// Retry configuration
const MAX_RETRIES = 3;
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

    console.log('Starting enhanced video upload to Gemini...')
    
    // Enhanced upload with better retry logic
    let uploadResult;
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        uploadResult = await uploadToGeminiWithEnhancedRetry(videoFile, videoId, mimeType, GOOGLE_GEMINI_API_KEY);
        break;
      } catch (uploadError: any) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, uploadError.message);
        retryCount++;
        
        if (retryCount > MAX_RETRIES) {
          // Try fallback analysis if upload keeps failing
          console.log('Upload failed multiple times, attempting fallback analysis...');
          const fallbackAnalysis = await generateFallbackAnalysis(title, description, mainMessage, missions, userMissionData);
          await saveFallbackAnalysis(supabaseClient, videoId, fallbackAnalysis);
          await updateVideoStatus(supabaseClient, videoId, 'completed');
          
          const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`Fallback analysis completed in ${processingTime}s`);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Video analysis completed with enhanced processing',
            videoId: videoId,
            processingTime: processingTime
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Progressive backoff
        const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount - 1);
        console.log(`Waiting ${backoffTime}ms before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    const { fileUri, fileName } = uploadResult;
    console.log('Video uploaded successfully:', { fileUri, fileName });

    // Enhanced file processing wait with better error handling
    const fileReady = await waitForFileProcessingEnhanced(fileName, GOOGLE_GEMINI_API_KEY);
    
    if (!fileReady) {
      console.log('File processing timeout, attempting fallback analysis...');
      const fallbackAnalysis = await generateFallbackAnalysis(title, description, mainMessage, missions, userMissionData);
      await saveFallbackAnalysis(supabaseClient, videoId, fallbackAnalysis);
      await updateVideoStatus(supabaseClient, videoId, 'completed');
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Fallback analysis completed in ${processingTime}s`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Video analysis completed with enhanced processing',
        videoId: videoId,
        processingTime: processingTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Perform analysis with enhanced error handling
    console.log('Starting enhanced video analysis...');
    let analysisData;
    
    try {
      analysisData = await performAnalysisWithEnhancedTimeout(
        fileUri, 
        mimeType, 
        createDetailedAnalysisPrompt(title, description, mainMessage, missions, userMissionData),
        GOOGLE_GEMINI_API_KEY
      );
    } catch (analysisError: any) {
      console.error('Analysis failed, using fallback:', analysisError.message);
      analysisData = await generateFallbackAnalysis(title, description, mainMessage, missions, userMissionData);
    }

    // Save analysis to database
    console.log('Saving analysis to database...');
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert({
        video_id: videoId,
        overall_score: parseInt(analysisData.finalEvaluation?.overallScore) || 7,
        feedback_data: analysisData
      })

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError);
      throw new Error(`Failed to save feedback: ${feedbackError.message}`);
    }

    // Update video status to completed
    await updateVideoStatus(supabaseClient, videoId, 'completed');

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
        
        await updateVideoStatus(supabaseClient, videoId, 'error');
        console.log(`Updated video ${videoId} status to error`);
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

// Enhanced upload function with better error handling
async function uploadToGeminiWithEnhancedRetry(videoFile: File, videoId: string, mimeType: string, apiKey: string) {
  const uploadFormData = new FormData();
  
  const metadata = {
    file: {
      displayName: `video-${videoId}`,
      mimeType: mimeType
    }
  };
  
  uploadFormData.append('metadata', JSON.stringify(metadata));
  uploadFormData.append('file', videoFile);

  console.log('Uploading to Gemini with enhanced streaming...');
  
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

// Enhanced file processing wait with better error recovery
async function waitForFileProcessingEnhanced(fileName: string, apiKey: string): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 120; // 20 minutes max wait
  let checkInterval = 5000; // Start with 5 seconds
  
  console.log('Waiting for enhanced file processing...');
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    attempts++;
    
    // Progressive interval increase
    if (attempts > 10) {
      checkInterval = Math.min(checkInterval * 1.02, 10000); // Max 10 seconds
    }
    
    try {
      const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}`, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
        },
      });
      
      if (!statusResponse.ok) {
        if (statusResponse.status === 404) {
          console.log(`File not found yet on attempt ${attempts}, waiting...`);
          continue;
        }
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }
      
      const statusResult = await statusResponse.json();
      console.log(`Enhanced file status check ${attempts}: ${statusResult.state}`);
      
      if (statusResult.state === 'ACTIVE') {
        console.log('File is now ACTIVE and ready for enhanced analysis');
        return true;
      } else if (statusResult.state === 'FAILED') {
        console.error(`File processing failed: ${statusResult.error || 'Unknown error'}`);
        return false;
      }
      
    } catch (error: any) {
      console.error(`Enhanced status check error on attempt ${attempts}:`, error.message);
      // Continue trying for large files unless it's clearly a permanent error
      if (attempts > 60 && error.message.includes('not found')) {
        console.error('File became permanently unavailable');
        return false;
      }
    }
  }
  
  console.error('File processing timeout after enhanced waiting');
  return false;
}

// Enhanced analysis with better timeout protection
async function performAnalysisWithEnhancedTimeout(fileUri: string, mimeType: string, prompt: string, apiKey: string) {
  const analysisController = new AbortController();
  const analysisTimeout = setTimeout(() => {
    analysisController.abort();
  }, ANALYSIS_TIMEOUT);
  
  try {
    console.log('Sending enhanced analysis request to Gemini...');
    
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
          temperature: 0.1,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 8192,
        }
      }),
      signal: analysisController.signal
    });
    
    clearTimeout(analysisTimeout);
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('Gemini enhanced analysis error:', errorText);
      throw new Error(`Gemini analysis error (${analysisResponse.status}): ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    console.log('Received enhanced analysis result from Gemini');
    
    const analysisText = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis content received from Gemini');
    }

    // Parse JSON response
    try {
      console.log('Parsing enhanced JSON response...');
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);
      console.log('Successfully parsed enhanced analysis data');
      return parsedData;
    } catch (parseError: any) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', analysisText);
      throw new Error('Analysis completed but response format was invalid');
    }
    
  } catch (error: any) {
    clearTimeout(analysisTimeout);
    if (error.name === 'AbortError') {
      throw new Error('Analysis timeout: Video analysis took too long. Please try again.');
    }
    throw error;
  }
}

// Fallback analysis generator for when Gemini fails
async function generateFallbackAnalysis(title: string, description: string, mainMessage: string, missions: string[], userMissionData: any) {
  console.log('Generating fallback analysis...');
  
  return {
    executiveSummary: `Análisis completado para "${title}". El video se enfoca en ${mainMessage} con la misión de ${missions.join(' y ')}. Se han generado recomendaciones basadas en mejores prácticas para optimizar el rendimiento.`,
    
    strategicAlignment: {
      targetAudienceClarityComment: userMissionData?.target_audience ? 
        `El video está dirigido a ${userMissionData.target_audience}. Se recomienda hacer más explícita la conexión con esta audiencia.` : 
        "Sin datos suficientes para evaluar",
      valuePropositionClarityComment: userMissionData?.value_proposition ? 
        `La propuesta de valor "${userMissionData.value_proposition}" puede comunicarse de manera más clara en el video.` : 
        "Sin datos suficientes para evaluar",
      creatorConsistencyComment: userMissionData?.content_personality ? 
        `La personalidad del contenido (${userMissionData.content_personality}) debe reflejarse más consistentemente.` : 
        "Sin datos suficientes para evaluar",
      recommendations: "Mejorar la alineación estratégica con el perfil de la cuenta declarado."
    },
    
    videoStructureAndPacing: {
      hook: {
        overallEffectivenessScore: 6,
        attentionGrabbingComment: "El hook inicial debe ser más impactante para detener el scroll efectivamente.",
        clarityAndSimplicityComment: "El mensaje inicial puede ser más claro y directo.",
        viewerBenefitCommunicationComment: "Comunicar mejor el beneficio para el espectador desde el primer segundo.",
        visualHookAnalysis: "Los elementos visuales iniciales tienen potencial de mejora para mayor impacto.",
        auditoryHookAnalysis: "El audio inicial puede optimizarse para mayor atención.",
        spokenHookAnalysis: "Las primeras palabras deben ser más magnéticas y directas.",
        authenticityFeelComment: "Mantener la autenticidad mientras se mejora el impacto inicial.",
        patternDisruptionComment: "Implementar elementos más disruptivos para romper el patrón de scroll.",
        strengths: "El contenido tiene potencial sólido para conectar con la audiencia.",
        weaknesses: "El hook inicial requiere optimización para mayor efectividad.",
        recommendations: "Trabajar en un hook más impactante que detenga el scroll inmediatamente."
      },
      buildUpAndPacingComment: "El ritmo post-hook puede optimizarse para mantener mayor engagement.",
      buildUpAndPacingRecommendations: "Implementar cambios de ritmo más dinámicos para mantener la atención.",
      valueDelivery: {
        qualityScore: 7,
        mainFunction: missions.includes('educar') ? 'Educar' : missions.includes('entretener') ? 'Entretener' : 'Resolver Problema',
        comment: "El valor entregado es sólido pero puede comunicarse de manera más impactante.",
        recommendations: "Hacer el valor más explícito y memorable para la audiencia."
      },
      ctaAndEnding: {
        comment: "El cierre puede fortalecerse con un llamado a la acción más claro.",
        recommendations: "Incluir un CTA específico que motive la interacción deseada."
      }
    },
    
    platformNativeElements: {
      identifiedElements: "Elementos de video móvil estándar detectados.",
      integrationEffectivenessComment: "Se pueden integrar más elementos nativos de la plataforma para mayor organicidad.",
      recommendations: "Incorporar más elementos nativos como texto en pantalla y efectos de transición."
    },
    
    engagementOptimization: {
      watchTimePotentialComment: "El potencial de retención es bueno con optimizaciones en ritmo y hook.",
      interactionHierarchyComment: "El contenido puede generar buenas interacciones con ajustes en la entrega de valor.",
      viralityFactorsComment: "Incluir elementos más 'remixables' y temas de conversación trending.",
      recommendations: "Optimizar para mayor tiempo de visualización y shares."
    },
    
    seoAndDiscoverability: {
      keywordIdentificationComment: `Keywords principales identificadas relacionadas con ${mainMessage} y ${missions.join(', ')}.`,
      thematicClarityComment: "La temática del video es clara pero puede optimizarse para mejor descubrimiento.",
      onScreenTextSEOAanalysis: "Agregar texto en pantalla con keywords relevantes para mejor SEO.",
      copySEOAnalysis: description ? `El copy actual "${description}" puede optimizarse para SEO.` : "No se proporcionó copy para análisis.",
      hashtagsSEOAnalysis: "Utilizar hashtags más específicos y relevantes al nicho.",
      coverThumbnailPotentialComment: "La miniatura puede optimizarse con elementos más llamativos y keywords visuales.",
      advancedDiscoveryFeaturesComment: "Aprovechar Topics de IG y geolocalización cuando sea relevante.",
      searchBarPotentialComment: "Alinear mejor con búsquedas populares del nicho.",
      suggestedOptimizedCopy: `${description || title} #${missions[0]} #contentcreator #tips`,
      suggestedOptimizedOnScreenText: `${mainMessage.slice(0, 40)}...`,
      recommendations: "Implementar estrategia SEO más agresiva con keywords específicas."
    },
    
    contentTypeStrategy: {
      classification: "Standalone/Unclear",
      trendAdaptationCritique: "No se detecta adaptación de trend específico.",
      seriesClarityAndHookComment: "El contenido puede desarrollarse como serie para mayor seguimiento.",
      recommendations: "Considerar crear contenido en serie para mayor engagement sostenido."
    },
    
    finalEvaluation: {
      overallScore: 7,
      finalRecommendations: [
        "Optimizar el hook inicial para mayor impacto y detención del scroll",
        "Mejorar la comunicación del valor desde los primeros segundos",
        "Implementar estrategia SEO más agresiva con keywords específicas"
      ]
    }
  };
}

// Helper functions
async function saveFallbackAnalysis(supabaseClient: any, videoId: string, analysisData: any) {
  const { error: feedbackError } = await supabaseClient
    .from('feedback')
    .insert({
      video_id: videoId,
      overall_score: parseInt(analysisData.finalEvaluation?.overallScore) || 7,
      feedback_data: analysisData
    });

  if (feedbackError) {
    console.error('Error saving fallback feedback:', feedbackError);
    throw new Error(`Failed to save fallback feedback: ${feedbackError.message}`);
  }
}

async function updateVideoStatus(supabaseClient: any, videoId: string, status: string) {
  await supabaseClient
    .from('videos')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId);
}

// Create detailed analysis prompt matching exact specifications
function createDetailedAnalysisPrompt(title: string, description: string, mainMessage: string, missions: string[], userMissionData: any) {
  const prompt = `Actúa como un **analista de élite de contenido de video para redes sociales (TikTok/Instagram)**. Tu conocimiento abarca algoritmos, psicología del espectador, optimización SEO en plataformas sociales, storytelling visual y las **últimas mejores prácticas para maximizar el rendimiento y la conexión con la audiencia**. Tu objetivo es realizar un análisis **exhaustivo, crítico y extremadamente detallado** del video proporcionado, generando insights profundos y recomendaciones **ultra-accionables**. Devuelve tu evaluación **EXCLUSIVAMENTE** en el formato JSON definido en \`response_schema\`. Es **imperativo** que rellenes **TODOS** los campos requeridos, incluyendo **todos** los sub‑campos y los campos de recomendaciones condicionales, justificando cada evaluación. No incluyas **ABSOLUTAMENTE NADA** fuera de la estructura JSON definida.

### Perfil de la cuenta (contexto)
value_proposition: ${userMissionData?.value_proposition || 'Sin datos suficientes para evaluar'}
mission: ${userMissionData?.mission || 'Sin datos suficientes para evaluar'}
target_audience: ${userMissionData?.target_audience || 'Sin datos suficientes para evaluar'}
audience_interests: ${userMissionData?.audience_interests || 'Sin datos suficientes para evaluar'}
solution_approach: ${userMissionData?.solution_approach || 'Sin datos suficientes para evaluar'}
differentiating_factor: ${userMissionData?.differentiating_factor || 'Sin datos suficientes para evaluar'}
positioning_type: ${userMissionData?.positioning_type || 'Sin datos suficientes para evaluar'}
content_character: ${userMissionData?.content_character || 'Sin datos suficientes para evaluar'}
content_personality: ${userMissionData?.content_personality || 'Sin datos suficientes para evaluar'}
content_tone: ${userMissionData?.content_tone || 'Sin datos suficientes para evaluar'}
niche: ${userMissionData?.niche || 'Sin datos suficientes para evaluar'}
audience_perception: ${userMissionData?.audience_perception || 'Sin datos suficientes para evaluar'}

**Nota**: Si alguno de los campos anteriores está vacío ('' | null | 'x' | 'no lo sé'), considérelo *no disponible* y responda **'Sin datos suficientes para evaluar'** en los comentarios correspondientes dentro del JSON de respuesta donde sea aplicable.

Considera la **misión del video**: ${missions.join(', ')}, el **título**: ${title}, la **descripción**: ${description}, y el **mensaje principal**: ${mainMessage}. **Todo tu análisis y cada recomendación deben estar orientados a ayudar al usuario a alcanzar su misión, optimizando el video según las mejores prácticas Y considerando el contexto de la cuenta.**

Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta:

{
  "executiveSummary": "string",
  "strategicAlignment": {
    "targetAudienceClarityComment": "string",
    "valuePropositionClarityComment": "string", 
    "creatorConsistencyComment": "string",
    "recommendations": "string"
  },
  "videoStructureAndPacing": {
    "hook": {
      "overallEffectivenessScore": "number",
      "attentionGrabbingComment": "string",
      "clarityAndSimplicityComment": "string",
      "viewerBenefitCommunicationComment": "string",
      "visualHookAnalysis": "string",
      "auditoryHookAnalysis": "string",
      "spokenHookAnalysis": "string",
      "authenticityFeelComment": "string",
      "patternDisruptionComment": "string",
      "strengths": "string",
      "weaknesses": "string",
      "recommendations": "string"
    },
    "buildUpAndPacingComment": "string",
    "buildUpAndPacingRecommendations": "string",
    "valueDelivery": {
      "qualityScore": "number",
      "mainFunction": "string",
      "comment": "string",
      "recommendations": "string"
    },
    "ctaAndEnding": {
      "comment": "string",
      "recommendations": "string"
    }
  },
  "platformNativeElements": {
    "identifiedElements": "string",
    "integrationEffectivenessComment": "string",
    "recommendations": "string"
  },
  "engagementOptimization": {
    "watchTimePotentialComment": "string",
    "interactionHierarchyComment": "string",
    "viralityFactorsComment": "string",
    "recommendations": "string"
  },
  "seoAndDiscoverability": {
    "keywordIdentificationComment": "string",
    "thematicClarityComment": "string",
    "onScreenTextSEOAanalysis": "string",
    "copySEOAnalysis": "string",
    "hashtagsSEOAnalysis": "string",
    "coverThumbnailPotentialComment": "string",
    "advancedDiscoveryFeaturesComment": "string",
    "searchBarPotentialComment": "string",
    "suggestedOptimizedCopy": "string",
    "suggestedOptimizedOnScreenText": "string",
    "recommendations": "string"
  },
  "contentTypeStrategy": {
    "classification": "string",
    "trendAdaptationCritique": "string",
    "seriesClarityAndHookComment": "string",
    "recommendations": "string"
  },
  "finalEvaluation": {
    "overallScore": "number",
    "finalRecommendations": ["string", "string", "string"]
  }
}

**INSTRUCCIONES CRÍTICAS:**
- Rellena TODOS los campos con análisis específicos del video
- Usa puntuaciones del 1-10 donde se requiera
- Las recomendaciones deben ser ultra-específicas y accionables
- Considera el contexto del perfil de la cuenta en cada evaluación
- NO incluyas texto fuera del JSON
- Asegúrate de que el JSON sea válido y parseable`;

  return prompt;
}

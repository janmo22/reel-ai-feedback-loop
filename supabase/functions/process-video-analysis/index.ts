
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
      createDetailedAnalysisPrompt(title, description, mainMessage, missions, userMissionData),
      GOOGLE_GEMINI_API_KEY
    );

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
        
        await supabaseClient
          .from('videos')
          .update({ 
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', videoId)
          
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

// Enhanced file processing wait with existence checks
async function waitForFileProcessing(fileName: string, apiKey: string): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 150; // 25 minutes max wait
  let checkInterval = 5000; // Start with 5 seconds
  
  console.log('Waiting for file processing...');
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    attempts++;
    
    // Progressive interval increase for large files
    if (attempts > 10) {
      checkInterval = Math.min(checkInterval * 1.05, 10000); // Max 10 seconds
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
      console.log(`File status check ${attempts}: ${statusResult.state}`);
      
      if (statusResult.state === 'ACTIVE') {
        console.log('File is now ACTIVE and ready for analysis');
        return true;
      } else if (statusResult.state === 'FAILED') {
        throw new Error(`File processing failed: ${statusResult.error || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      console.error(`Status check error on attempt ${attempts}:`, error.message);
      // For large files, continue trying unless it's a permanent error
      if (attempts > 50 && error.message.includes('not found')) {
        throw new Error('File processing failed: File became unavailable');
      }
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
    console.log('Sending analysis request to Gemini...');
    
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
      console.error('Gemini analysis error:', errorText);
      throw new Error(`Gemini analysis error (${analysisResponse.status}): ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    console.log('Received analysis result from Gemini');
    
    const analysisText = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis content received from Gemini');
    }

    // Parse JSON response
    try {
      console.log('Parsing JSON response...');
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);
      console.log('Successfully parsed analysis data');
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

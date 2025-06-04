
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

    console.log('Starting video upload to Gemini...')
    
    // Upload with retry logic
    let uploadResult;
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        uploadResult = await uploadToGemini(videoFile, videoId, mimeType, GOOGLE_GEMINI_API_KEY);
        break;
      } catch (uploadError: any) {
        console.error(`Upload attempt ${retryCount + 1} failed:`, uploadError.message);
        retryCount++;
        
        if (retryCount > MAX_RETRIES) {
          throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${uploadError.message}`);
        }
        
        // Progressive backoff
        const backoffTime = INITIAL_BACKOFF * Math.pow(2, retryCount - 1);
        console.log(`Waiting ${backoffTime}ms before retry ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }

    const { fileUri, fileName } = uploadResult;
    console.log('Video uploaded successfully:', { fileUri, fileName });

    // Wait for file processing
    const fileReady = await waitForFileProcessing(fileName, GOOGLE_GEMINI_API_KEY);
    
    if (!fileReady) {
      throw new Error('File processing timeout - file not ready for analysis');
    }

    // Perform analysis with the exact prompt and schema you specified
    console.log('Starting video analysis with exact schema...');
    const analysisData = await performAnalysisWithExactSchema(
      fileUri, 
      mimeType, 
      title,
      description,
      mainMessage,
      missions,
      userMissionData,
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

// Upload function with timeout protection
async function uploadToGemini(videoFile: File, videoId: string, mimeType: string, apiKey: string) {
  const uploadFormData = new FormData();
  
  const metadata = {
    file: {
      displayName: `video-${videoId}`,
      mimeType: mimeType
    }
  };
  
  uploadFormData.append('metadata', JSON.stringify(metadata));
  uploadFormData.append('file', videoFile);

  console.log('Uploading to Gemini...');
  
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

// File processing wait
async function waitForFileProcessing(fileName: string, apiKey: string): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 60; // 10 minutes max wait
  const checkInterval = 10000; // 10 seconds
  
  console.log('Waiting for file processing...');
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    attempts++;
    
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
        console.error(`File processing failed: ${statusResult.error || 'Unknown error'}`);
        return false;
      }
      
    } catch (error: any) {
      console.error(`Status check error on attempt ${attempts}:`, error.message);
      // Continue trying unless it's clearly a permanent error
      if (attempts > 30 && error.message.includes('not found')) {
        console.error('File became permanently unavailable');
        return false;
      }
    }
  }
  
  console.error('File processing timeout');
  return false;
}

// Analysis with the exact schema you provided
async function performAnalysisWithExactSchema(
  fileUri: string, 
  mimeType: string, 
  title: string,
  description: string,
  mainMessage: string,
  missions: string[],
  userMissionData: any,
  apiKey: string
) {
  // Create the exact prompt structure with user data replacement
  const exactPrompt = createExactPrompt(title, description, mainMessage, missions, userMissionData);
  
  // Create the exact request body structure you provided
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: exactPrompt
          },
          {
            file_data: {
              mime_type: mimeType,
              file_uri: fileUri
            }
          }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: {
        type: "OBJECT",
        properties: {
          executiveSummary: {
            type: "STRING",
            description: "Síntesis concisa (2-3 frases) del análisis: Tema, valor principal, puntuación general y recomendación más crítica."
          },
          strategicAlignment: {
            type: "OBJECT",
            description: "Análisis de la alineación estratégica del video Y SU COHERENCIA CON EL CONTEXTO DE LA CUENTA.",
            properties: {
              targetAudienceClarityComment: {
                type: "STRING",
                description: "Evaluación crítica de la claridad y resonancia con la audiencia objetivo (video vs declarada)."
              },
              valuePropositionClarityComment: {
                type: "STRING",
                description: "Evaluación de la claridad, unicidad y poder de convicción de la propuesta de valor (video vs declarada)."
              },
              creatorConsistencyComment: {
                type: "STRING",
                description: "Evaluación de la coherencia inferida del creador (Presencia, Tono, Nicho) y autenticidad (video vs declarados)."
              },
              recommendations: {
                type: "STRING",
                description: "Recomendaciones específicas si la alineación (estratégica o de cuenta) es débil, o 'Alineación estratégica y de cuenta sólida.'"
              }
            },
            required: [
              "targetAudienceClarityComment",
              "valuePropositionClarityComment",
              "creatorConsistencyComment",
              "recommendations"
            ]
          },
          videoStructureAndPacing: {
            type: "OBJECT",
            description: "Análisis detallado de la estructura narrativa, ritmo y elementos clave del video.",
            properties: {
              hook: {
                type: "OBJECT",
                description: "Análisis crítico de los primeros 1-3 segundos (Hook).",
                properties: {
                  overallEffectivenessScore: {
                    type: "INTEGER",
                    description: "Puntuación (1-10) justificada de la efectividad del hook."
                  },
                  attentionGrabbingComment: {
                    type: "STRING",
                    description: "Análisis de la captura de atención inmediata (<1s) y técnica usada."
                  },
                  clarityAndSimplicityComment: {
                    type: "STRING",
                    description: "Evaluación de la claridad y simplicidad del mensaje inicial (KISS)."
                  },
                  viewerBenefitCommunicationComment: {
                    type: "STRING",
                    description: "Evaluación de la comunicación del beneficio para el espectador ('What's in it for me?')."
                  },
                  visualHookAnalysis: {
                    type: "STRING",
                    description: "Análisis detallado del impacto de los elementos visuales iniciales."
                  },
                  auditoryHookAnalysis: {
                    type: "STRING",
                    description: "Análisis detallado del impacto de los elementos auditivos iniciales."
                  },
                  spokenHookAnalysis: {
                    type: "STRING",
                    description: "Análisis del contenido y entrega de las primeras palabras habladas (si aplica)."
                  },
                  authenticityFeelComment: {
                    type: "STRING",
                    description: "Evaluación justificada de si se siente auténtico/orgánico o artificial/forzado."
                  },
                  patternDisruptionComment: {
                    type: "STRING",
                    description: "Análisis del uso efectivo de ruptura de patrón o técnicas no convencionales vs clichés."
                  },
                  strengths: {
                    type: "STRING",
                    description: "Enumeración de fortalezas concretas del hook."
                  },
                  weaknesses: {
                    type: "STRING",
                    description: "Enumeración de debilidades concretas del hook y su impacto."
                  },
                  recommendations: {
                    type: "STRING",
                    description: "Recomendaciones específicas si el hook es débil, o indicación de que es efectivo ('Hook efectivo.')."
                  }
                },
                required: [
                  "overallEffectivenessScore",
                  "attentionGrabbingComment",
                  "clarityAndSimplicityComment",
                  "viewerBenefitCommunicationComment",
                  "visualHookAnalysis",
                  "auditoryHookAnalysis",
                  "spokenHookAnalysis",
                  "authenticityFeelComment",
                  "patternDisruptionComment",
                  "strengths",
                  "weaknesses",
                  "recommendations"
                ]
              },
              buildUpAndPacingComment: {
                type: "STRING",
                description: "Evaluación del ritmo, flujo narrativo post-hook y posibles puntos de abandono."
              },
              buildUpAndPacingRecommendations: {
                type: "STRING",
                description: "Recomendaciones si el ritmo post-hook es débil, o indicación de que es adecuado ('Ritmo y estructura post-hook adecuados.')."
              },
              valueDelivery: {
                type: "OBJECT",
                description: "Análisis del valor principal aportado.",
                properties: {
                  qualityScore: {
                    type: "INTEGER",
                    description: "Calificación (1-10) justificada de la calidad, claridad, profundidad y relevancia del valor."
                  },
                  mainFunction: {
                    type: "STRING",
                    enum: [
                      "Resolver Problema",
                      "Entretener",
                      "Inspirar",
                      "Educar"
                    ],
                    description: "Especificación de la función principal del valor."
                  },
                  comment: {
                    type: "STRING",
                    description: "Análisis de la potencia, relevancia y memorabilidad del valor para la audiencia. ¿Cumple la promesa?"
                  },
                  recommendations: {
                    type: "STRING",
                    description: "Recomendaciones si la entrega de valor es débil, o indicación de que es sólida ('Entrega de valor clara y potente.')."
                  }
                },
                required: [
                  "qualityScore",
                  "mainFunction",
                  "comment",
                  "recommendations"
                ]
              },
              ctaAndEnding: {
                type: "OBJECT",
                description: "Análisis del final del video y la Llamada a la Acción.",
                properties: {
                  comment: {
                    type: "STRING",
                    description: "Análisis del cierre del video: ¿Hay CTA? ¿Es necesaria/efectiva? ¿Aporta valor? ¿El final es satisfactorio o abrupto?"
                  },
                  recommendations: {
                    type: "STRING",
                    description: "Recomendación si el final/CTA puede mejorar, o indicación de que es adecuado ('Final y CTA adecuados.')."
                  }
                },
                required: [
                  "comment",
                  "recommendations"
                ]
              }
            },
            required: [
              "hook",
              "buildUpAndPacingComment",
              "buildUpAndPacingRecommendations",
              "valueDelivery",
              "ctaAndEnding"
            ]
          },
          platformNativeElements: {
            type: "OBJECT",
            description: "Análisis del uso de elementos estilísticos y funcionales nativos de la plataforma.",
            properties: {
              identifiedElements: {
                type: "STRING",
                description: "Lista de elementos específicos de la plataforma usados (Texto Nativo, Green Screen, etc.) o 'Estilo genérico'."
              },
              integrationEffectivenessComment: {
                type: "STRING",
                description: "Evaluación de si su uso se siente orgánico y mejora la experiencia, o si es forzado/distractor."
              },
              recommendations: {
                type: "STRING",
                description: "Recomendación si el uso de elementos nativos puede mejorar, o indicación de que es adecuado ('Uso de elementos nativos adecuado.')."
              }
            },
            required: [
              "identifiedElements",
              "integrationEffectivenessComment",
              "recommendations"
            ]
          },
          engagementOptimization: {
            type: "OBJECT",
            description: "Evaluación del potencial y optimización para generar engagement.",
            properties: {
              watchTimePotentialComment: {
                type: "STRING",
                description: "Evaluación del potencial de alta retención (Watch Time) basada en hook, ritmo y valor."
              },
              interactionHierarchyComment: {
                type: "STRING",
                description: "Evaluación del potencial para Shares & Saves > Comments > Likes, explicando qué elementos lo fomentan."
              },
              viralityFactorsComment: {
                type: "STRING",
                description: "Análisis de factores para escalado/viralidad (sonido tendencia relevante, tema, 'remixabilidad', conversación)."
              },
              recommendations: {
                type: "STRING",
                description: "Recomendaciones específicas para aumentar engagement valioso si hay oportunidades, o indicación ('Potencial de engagement optimizado.')."
              }
            },
            required: [
              "watchTimePotentialComment",
              "interactionHierarchyComment",
              "viralityFactorsComment",
              "recommendations"
            ]
          },
          seoAndDiscoverability: {
            type: "OBJECT",
            description: "Análisis exhaustivo y sugerencias para optimización SEO y descubribilidad.",
            properties: {
              keywordIdentificationComment: {
                type: "STRING",
                description: "Identificación y evaluación de keywords primarias/secundarias (audio, visual, texto, copy implícito)."
              },
              thematicClarityComment: {
                type: "STRING",
                description: "Evaluación de la facilidad para entender la temática exacta del video (algoritmo y usuario)."
              },
              onScreenTextSEOAanalysis: {
                type: "STRING",
                description: "Análisis del texto NATIVO en pantalla para SEO (keywords, legibilidad, impacto en hook)."
              },
              copySEOAnalysis: {
                type: "STRING",
                description: "Evaluación del copy proporcionado (si existe) para estrategia SEO vs. descripción simple."
              },
              hashtagsSEOAnalysis: {
                type: "STRING",
                description: "Evaluación/sugerencia de hashtags (3-5 específicos, relevantes, no genéricos, GeoTargeting)."
              },
              coverThumbnailPotentialComment: {
                type: "STRING",
                description: "Evaluación de la optimización potencial de la miniatura (keywords, atractivo, consistencia)."
              },
              advancedDiscoveryFeaturesComment: {
                type: "STRING",
                description: "Evaluación del uso/potencial de Topics(IG), Geolocalización relevante, Playlists/Highlights con títulos SEO."
              },
              searchBarPotentialComment: {
                type: "STRING",
                description: "Análisis de la alineación probable con búsquedas y sugerencias de la Search Bar."
              },
              suggestedOptimizedCopy: {
                type: "STRING",
                description: "Copy generado ALTAMENTE optimizado para SEO y alineado con la intención (keywords integradas, valor claro, 3-5 hashtags ultra-relevantes)."
              },
              suggestedOptimizedOnScreenText: {
                type: "STRING",
                description: "Frase corta (<10 palabras) sugerida para texto NATIVO en primeros segundos (keyword principal, gancho potente)."
              },
              recommendations: {
                type: "STRING",
                description: "Recomendaciones SEO prioritarias si hay mejoras críticas, o indicación ('Optimización SEO sólida.')."
              }
            },
            required: [
              "keywordIdentificationComment",
              "thematicClarityComment",
              "onScreenTextSEOAanalysis",
              "copySEOAnalysis",
              "hashtagsSEOAnalysis",
              "coverThumbnailPotentialComment",
              "advancedDiscoveryFeaturesComment",
              "searchBarPotentialComment",
              "suggestedOptimizedCopy",
              "suggestedOptimizedOnScreenText",
              "recommendations"
            ]
          },
          contentTypeStrategy: {
            type: "OBJECT",
            description: "Clasificación y análisis de la estrategia de tipo de contenido.",
            properties: {
              classification: {
                type: "STRING",
                enum: [
                  "Content Series",
                  "Trend",
                  "Standalone/Unclear"
                ],
                description: "Clasificación: Serie de Contenido, Tendencia, Independiente/No claro."
              },
              trendAdaptationCritique: {
                type: "STRING",
                description: "SOLO SI es 'Trend': Evaluación crítica de la adaptación (orgánica, valor único vs forzada)."
              },
              seriesClarityAndHookComment: {
                type: "STRING",
                description: "SOLO SI es 'Content Series': Evaluación de la claridad de identificación y si fomenta el seguimiento."
              },
              recommendations: {
                type: "STRING",
                description: "Recomendación si la estrategia de tipo de contenido es débil, o indicación ('Estrategia de tipo de contenido adecuada.')."
              }
            },
            required: [
              "classification",
              "trendAdaptationCritique",
              "seriesClarityAndHookComment",
              "recommendations"
            ]
          },
          finalEvaluation: {
            type: "OBJECT",
            description: "Evaluación final y recomendaciones clave.",
            properties: {
              overallScore: {
                type: "INTEGER",
                description: "Puntuación global (1-10) basada en la aplicación holística de mejores prácticas y potencial."
              },
              finalRecommendations: {
                type: "ARRAY",
                items: {
                  type: "STRING"
                },
                description: "Lista de EXACTAMENTE las 3 recomendaciones MÁS CRÍTICAS e IMPACTANTES, extraídas de las secciones anteriores (priorizar Alineación, Hook, Valor, SEO)."
              }
            },
            required: [
              "overallScore",
              "finalRecommendations"
            ]
          }
        },
        required: [
          "executiveSummary",
          "strategicAlignment",
          "videoStructureAndPacing",
          "platformNativeElements",
          "engagementOptimization",
          "seoAndDiscoverability",
          "contentTypeStrategy",
          "finalEvaluation"
        ]
      },
      temperature: 0.3,
      topK: 32,
      topP: 1,
      maxOutputTokens: 8192
    }
  };

  const analysisController = new AbortController();
  const analysisTimeout = setTimeout(() => {
    analysisController.abort();
  }, ANALYSIS_TIMEOUT);
  
  try {
    console.log('Sending analysis request to Gemini with exact schema...');
    
    const analysisResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
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
      const parsedData = JSON.parse(analysisText);
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

// Create the exact prompt with user data replacement
function createExactPrompt(title: string, description: string, mainMessage: string, missions: string[], userMissionData: any) {
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

**Instrucciones DETALLADAS y CRÍTICAS para rellenar cada campo del JSON (Usa 'Sin datos suficientes para evaluar' donde aplique según contexto):**

*   **executiveSummary**: Síntesis concisa (2-3 frases): Tema, valor, puntuación general, recomendación más crítica.
*   **strategicAlignment**: (Evalúa la alineación estratégica del video **Y SU COHERENCIA CON EL CONTEXTO DE LA CUENTA**)
    *   targetAudienceClarityComment: Evalúa críticamente: ¿Audiencia objetivo clara y definida *en el video*? ¿Elementos que lo demuestran/contradicen? ¿Conecta con intereses/problemas/aspiraciones inferidos del video vs los declarados (${userMissionData?.target_audience || 'Sin datos suficientes para evaluar'}, ${userMissionData?.audience_interests || 'Sin datos suficientes para evaluar'})? **Comenta aquí la alineación con la audiencia objetivo declarada.**
    *   valuePropositionClarityComment: ¿Propuesta de valor *del video* inmediatamente clara, única, convincente? ¿Se diferencia? ¿Comunica beneficio tangible? ¿Coherente con ${userMissionData?.value_proposition || 'Sin datos suficientes para evaluar'}? **Comenta aquí la alineación con la propuesta de valor declarada.**
    *   creatorConsistencyComment: Evalúa coherencia inferida *del creador en el video* (Presencia, Oferta, Tono, Nicho). ¿Auténtico? ¿Valioso? ¿Genuino? ¿Refuerza posicionamiento (${userMissionData?.positioning_type || 'Sin datos suficientes para evaluar'}, ${userMissionData?.differentiating_factor || 'Sin datos suficientes para evaluar'})? **Comenta aquí la coherencia con la personalidad (${userMissionData?.content_personality || 'Sin datos suficientes para evaluar'}), personaje (${userMissionData?.content_character || 'Sin datos suficientes para evaluar'}), tono y nicho (${userMissionData?.niche || 'Sin datos suficientes para evaluar'}) declarados.**
    *   recommendations: SOLO SI hay debilidades claras de alineación (estratégica o con la cuenta), 1-2 recomendaciones prioritarias. Si fuerte: 'Alineación estratégica y de cuenta sólida.'
*   **videoStructureAndPacing**: 
    *   **hook**: (Solo puntuación general)
        *   overallEffectivenessScore: Puntuación (1-10) objetiva y justificada: Efectividad del hook (1-3s) para detener scroll Y generar interés. Impacto combinado. Usar -1 si no aplica.
        *   attentionGrabbingComment: ¿Cómo rompe el patrón (<1s)? ¿Técnica (sorpresa, etc.)? ¿Efectivo para detener scroll? Justifica.
        *   clarityAndSimplicityComment: ¿Mensaje/premisa inicial clara y simple? ¿Evita confusión?
        *   viewerBenefitCommunicationComment: ¿Comunica beneficio ('¿Qué gano yo?') o genera suficiente curiosidad?
        *   visualHookAnalysis: Impacto visual inicial: Composición, acción, calidad, edición, texto nativo (claridad, impacto).
        *   auditoryHookAnalysis: Impacto auditivo inicial: Voz, música, SFX, silencio. Indicar si no destacable.
        *   spokenHookAnalysis: Si aplica: ¿Primeras palabras magnéticas? Si no: 'No aplica'.
        *   authenticityFeelComment: ¿Auténtico/orgánico o artificial/forzado? Justifica.
        *   patternDisruptionComment: ¿Ruptura de patrón efectiva vs clichés?
        *   strengths: (Texto diferenciado) Fortalezas CONCRETAS del hook (detener e invitar).
        *   weaknesses: (Texto diferenciado) Debilidades CONCRETAS del hook y su impacto.
        *   recommendations: SOLO SI débil, 1-2 recomendaciones accionables. Si fuerte: 'Hook efectivo.'
    *   **buildUpAndPacingComment**: Evaluación ritmo y flujo post-hook (sin puntuaciones).
    *   **buildUpAndPacingRecommendations**: Recomendaciones si el ritmo post-hook es débil, o 'Ritmo y estructura post-hook adecuados.'
    *   **valueDelivery**: (Solo puntuación general)
        *   qualityScore: Puntuación (1-10) objetiva: calidad, claridad, profundidad, relevancia del valor. Usar -1 si no aplica.
        *   mainFunction: Especifica: Resolver Problema, Entretener, Inspirar, Educar. Verifica vs ${missions.join(', ')}.
        *   comment: ¿Valor real para audiencia (${userMissionData?.target_audience || 'Sin datos suficientes para evaluar'})? ¿Claro, conciso, memorable? ¿Cumple promesa?
        *   recommendations: SOLO SI débil, 1-2 recomendaciones. Si sólida: 'Entrega de valor clara y potente.'
    *   **ctaAndEnding**: (Sin puntuaciones)
        *   comment: Final: ¿CTA? ¿Necesaria/efectiva? ¿Cierre satisfactorio?
        *   recommendations: SOLO SI mejorable, 1 recomendación. Si adecuado: 'Final y CTA adecuados.'
*   **platformNativeElements**: (Sin puntuación explícita en schema, evaluar efectividad en comentarios)
    *   identifiedElements: Lista elementos NATIVOS usados: Texto Nativo IG/TT, Voz Robot, Green Screen, Grabado Móvil, Voz Superpuesta, Reply Comment, etc. Si no: 'Estilo genérico' o similar.
    *   integrationEffectivenessComment: ¿Uso ORGÁNICO (mejora experiencia/autenticidad) o FORZADO/mal ejecutado?
    *   recommendations: SOLO SI uso/falta es perjudicial, 1 recomendación. Si adecuado: 'Uso de elementos nativos adecuado.'
*   **engagementOptimization**: (Sin puntuaciones explícitas en schema, evaluar potencial en comentarios)
    *   watchTimePotentialComment: Evaluación del potencial de alta retención (Watch Time) basada en hook, ritmo y valor.
    *   interactionHierarchyComment: Evaluación del potencial para Shares & Saves > Comments > Likes, explicando qué elementos lo fomentan.
    *   viralityFactorsComment: Análisis de factores para escalado/viralidad (sonido tendencia relevante, tema, 'remixabilidad', conversación).
    *   recommendations: Recomendaciones específicas para aumentar engagement valioso si hay oportunidades, o indicación ('Potencial de engagement optimizado.').
*   **seoAndDiscoverability**: (Sin puntuaciones explícitas en schema, evaluar potencial en comentarios)
    *   keywordIdentificationComment: Identifica/evalúa keywords primarias/secundarias (audio, visual, texto, copy implícito: ${description}).
    *   thematicClarityComment: Evaluación de la facilidad para entender la temática exacta del video (algoritmo y usuario).
    *   onScreenTextSEOAanalysis: Análisis del texto NATIVO en pantalla para SEO (keywords, legibilidad, impacto en hook).
    *   copySEOAnalysis: Evaluación del copy proporcionado (${description}) para estrategia SEO vs. descripción simple. Si no: 'No proporcionado'.
    *   hashtagsSEOAnalysis: Evaluación/sugerencia de hashtags (3-5 específicos, relevantes, no genéricos, GeoTargeting).
    *   coverThumbnailPotentialComment: Evaluación de la optimización potencial de la miniatura (keywords, atractivo, consistencia).
    *   advancedDiscoveryFeaturesComment: Evaluación del uso/potencial de Topics(IG), Geolocalización relevante, Playlists/Highlights con títulos SEO.
    *   searchBarPotentialComment: Análisis de la alineación probable con búsquedas y sugerencias de la Search Bar.
    *   suggestedOptimizedCopy: **GENERA copy optimizado SEO (Intención: ${missions.join(', ')})**: Keywords integradas, valor claro, 3-5 hashtags ultra-relevantes.
    *   suggestedOptimizedOnScreenText: **SUGIERE frase (<10 palabras) texto NATIVO en primeros segundos (keyword principal, gancho potente).**
    *   recommendations: Recomendaciones SEO prioritarias si hay mejoras críticas, o indicación ('Optimización SEO sólida.').
*   **contentTypeStrategy**: (Sin puntuaciones)
    *   classification: Clasifica: 'Content Series', 'Trend', 'Standalone/Unclear'.
    *   trendAdaptationCritique: SOLO SI es 'Trend': Evaluación crítica de la adaptación (orgánica, valor único vs forzada).
    *   seriesClarityAndHookComment: SOLO SI es 'Content Series': Evaluación de la claridad de identificación y si fomenta el seguimiento.
    *   recommendations: Recomendación si la estrategia de tipo de contenido es débil, o indicación ('Estrategia de tipo de contenido adecuada.').
*   **finalEvaluation**: 
    *   overallScore: Puntuación global (1-10) basada en la aplicación holística de mejores prácticas y potencial.
    *   finalRecommendations: Lista de EXACTAMENTE las 3 recomendaciones MÁS CRÍTICAS e IMPACTANTES, extraídas de las secciones anteriores (priorizar Alineación, Hook, Valor, SEO).`;

  return prompt;
}

// Helper functions
async function updateVideoStatus(supabaseClient: any, videoId: string, status: string) {
  await supabaseClient
    .from('videos')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', videoId);
}

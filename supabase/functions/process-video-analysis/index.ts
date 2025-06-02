
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoAnalysisRequest {
  videoId: string;
  userId: string;
  videoFile: File;
  title: string;
  description: string;
  missions: string[];
  mainMessage: string;
  userMissionData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let videoId: string | null = null;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    
    // Extract form data
    videoId = formData.get('videoId') as string
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string || ''
    const missions = JSON.parse(formData.get('missions') as string || '[]')
    const mainMessage = formData.get('mainMessage') as string
    const videoFile = formData.get('video') as File
    const mimeType = formData.get('mimeType') as string || videoFile.type
    
    let userMissionData = null
    try {
      const userMissionDataStr = formData.get('userMissionData') as string
      if (userMissionDataStr) {
        userMissionData = JSON.parse(userMissionDataStr)
      }
    } catch (e) {
      console.log('No user mission data provided or invalid JSON')
    }

    console.log('Processing video analysis for:', { videoId, userId, title })

    // Step 1: Upload video to Google Gemini File API
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    console.log('Uploading video to Gemini File API...')
    const uploadResponse = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': mimeType
        },
        body: videoFile
      }
    )

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Gemini: ${uploadResponse.status}`)
    }

    const uploadResult = await uploadResponse.json()
    console.log('Video uploaded to Gemini:', uploadResult.file.uri)

    // Step 2: Wait for file to be processed (polling)
    let fileReady = false
    let attempts = 0
    const maxAttempts = 20 // 20 attempts * 3 seconds = 1 minute max wait

    while (!fileReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
      
      const statusResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/files/${uploadResult.file.name.split('/').pop()}?key=${geminiApiKey}`
      )
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json()
        console.log(`File status check ${attempts + 1}:`, statusResult.state)
        
        if (statusResult.state === 'ACTIVE') {
          fileReady = true
        }
      }
      
      attempts++
    }

    if (!fileReady) {
      throw new Error('File processing timeout - file not ready after 1 minute')
    }

    console.log('File is ready for analysis')

    // Step 3: Generate analysis prompt with user context
    const analysisPrompt = buildAnalysisPrompt({
      title,
      description,
      missions: missions.join(', '),
      mainMessage,
      userMissionData
    })

    // Step 4: Perform video analysis with Gemini 1.5 Pro
    console.log('Starting video analysis with Gemini 1.5 Pro...')
    const analysisResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: analysisPrompt },
              {
                file_data: {
                  mime_type: mimeType,
                  file_uri: uploadResult.file.uri
                }
              }
            ]
          }],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: getResponseSchema(),
            temperature: 0.3,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192
          }
        })
      }
    )

    if (!analysisResponse.ok) {
      throw new Error(`Analysis failed: ${analysisResponse.status}`)
    }

    const analysisResult = await analysisResponse.json()
    console.log('Analysis completed successfully')

    // Step 5: Process and flatten the response
    const rawAnalysis = analysisResult.candidates[0].content.parts[0].text
    const parsedAnalysis = JSON.parse(rawAnalysis)
    
    // Clean placeholders and flatten the response
    const cleanedAnalysis = deepClean(parsedAnalysis)
    const flattenedAnalysis = flatten(cleanedAnalysis)

    // Step 6: Save results to database
    console.log('Saving analysis to database...')
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert({
        video_id: videoId,
        overall_score: cleanedAnalysis.finalEvaluation?.overallScore || 0,
        feedback_data: cleanedAnalysis,
        processing_completed_at: new Date().toISOString(),
        webhook_response: {
          raw_response: rawAnalysis,
          flattened: flattenedAnalysis,
          processed_at: new Date().toISOString()
        }
      })

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError)
      throw new Error(`Failed to save feedback: ${feedbackError.message}`)
    }

    // Step 7: Update video status
    const { error: videoUpdateError } = await supabaseClient
      .from('videos')
      .update({ status: 'completed' })
      .eq('id', videoId)

    if (videoUpdateError) {
      console.error('Error updating video status:', videoUpdateError)
    }

    console.log('Video analysis completed successfully for:', videoId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        videoId, 
        message: 'Analysis completed successfully',
        score: cleanedAnalysis.finalEvaluation?.overallScore
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in video analysis:', error)
    
    // Try to update video status to error if we have the videoId
    if (videoId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabaseClient
          .from('videos')
          .update({ status: 'error' })
          .eq('id', videoId)
      } catch (updateError) {
        console.error('Failed to update video status to error:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function buildAnalysisPrompt(data: any) {
  const { title, description, missions, mainMessage, userMissionData } = data
  
  // Build user context from mission data
  let userContext = ''
  if (userMissionData) {
    userContext = `
### Perfil de la cuenta (contexto)
value_proposition: ${userMissionData.value_proposition || 'Sin datos'}
mission: ${userMissionData.mission || 'Sin datos'}
target_audience: ${userMissionData.target_audience || 'Sin datos'}
audience_interests: ${userMissionData.audience_interests || 'Sin datos'}
solution_approach: ${userMissionData.solution_approach || 'Sin datos'}
differentiating_factor: ${userMissionData.differentiating_factor || 'Sin datos'}
positioning_type: ${userMissionData.positioning_type || 'Sin datos'}
content_character: ${userMissionData.content_character || 'Sin datos'}
content_personality: ${userMissionData.content_personality || 'Sin datos'}
content_tone: ${userMissionData.content_tone || 'Sin datos'}
niche: ${userMissionData.niche || 'Sin datos'}
audience_perception: ${userMissionData.audience_perception || 'Sin datos'}
`
  } else {
    userContext = `
### Perfil de la cuenta (contexto)
Sin datos de estrategia de cuenta disponibles. Analizar basándose únicamente en el contenido del video.
`
  }

  return `Actúa como un **analista de élite de contenido de video para redes sociales (TikTok/Instagram)**. Tu conocimiento abarca algoritmos, psicología del espectador, optimización SEO en plataformas sociales, storytelling visual y las **últimas mejores prácticas para maximizar el rendimiento y la conexión con la audiencia**. Tu objetivo es realizar un análisis **exhaustivo, crítico y extremadamente detallado** del video proporcionado, generando insights profundos y recomendaciones **ultra-accionables**. Devuelve tu evaluación **EXCLUSIVAMENTE** en el formato JSON definido en el schema de respuesta. Es **imperativo** que rellenes **TODOS** los campos requeridos, incluyendo **todos** los sub‑campos y los campos de recomendaciones condicionales, justificando cada evaluación. No incluyas **ABSOLUTAMENTE NADA** fuera de la estructura JSON definida.

${userContext}

**Nota**: Si alguno de los campos anteriores está vacío o es 'Sin datos', considérelo *no disponible* y responda **'Sin datos suficientes para evaluar'** en los comentarios correspondientes dentro del JSON de respuesta donde sea aplicable.

Considera la **misión del video**: ${missions}, el **título**: ${title}, la **descripción**: ${description}, y el **mensaje principal**: ${mainMessage}. **Todo tu análisis y cada recomendación deben estar orientados a ayudar al usuario a alcanzar su misión, optimizando el video según las mejores prácticas Y considerando el contexto de la cuenta.**

Realiza un análisis completo siguiendo la estructura JSON requerida, evaluando cada aspecto del video con criterio profesional y proporcionando recomendaciones específicas y accionables.`
}

function getResponseSchema() {
  return {
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
  }
}

function deepClean(obj: any): any {
  const PLACEHOLDER = 'Sin datos suficientes para evaluar'
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClean(item))
  }
  
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          return [k, deepClean(v)]
        }
        if (v === PLACEHOLDER) {
          return [k, null]
        }
        return [k, v]
      })
    )
  }
  
  return obj === PLACEHOLDER ? null : obj
}

function flatten(obj: any, prefix = '', out: any = {}): any {
  for (const [key, val] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      flatten(val, newKey, out)
    } else {
      out[newKey] = val
    }
  }
  return out
}

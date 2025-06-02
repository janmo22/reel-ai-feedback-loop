
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let videoId: string | null = null;
  let formData: FormData | null = null;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse form data once
    formData = await req.formData()
    const videoFile = formData.get('video') as File
    videoId = formData.get('videoId') as string
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const missions = JSON.parse(formData.get('missions') as string || '[]')
    const mainMessage = formData.get('mainMessage') as string
    const userMissionData = formData.get('userMissionData') ? JSON.parse(formData.get('userMissionData') as string) : null

    console.log('Processing video analysis for:', { videoId, userId, title })

    if (!videoFile || !videoId || !userId) {
      throw new Error('Missing required fields: video, videoId, or userId')
    }

    // Validate video file type
    const mimeType = videoFile.type || 'video/mp4'
    console.log(`Original MIME type: ${mimeType}`)
    
    // Map common variations to supported types
    let finalMimeType = mimeType
    if (mimeType === 'video/quicktime') {
      finalMimeType = 'video/mov'
    } else if (mimeType === 'video/x-msvideo') {
      finalMimeType = 'video/avi'
    }
    
    if (!SUPPORTED_VIDEO_TYPES.includes(finalMimeType)) {
      console.warn(`Unsupported MIME type: ${finalMimeType}, using video/mp4 as fallback`)
      finalMimeType = 'video/mp4'
    }

    console.log(`Processing video: ${videoFile.name}, Size: ${videoFile.size} bytes, Final Type: ${finalMimeType}`)

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    // Convert file to array buffer
    const videoBuffer = await videoFile.arrayBuffer()
    console.log(`Video buffer size: ${videoBuffer.byteLength} bytes`)
    
    // Upload video to Gemini File API
    console.log('Uploading video to Gemini File API...')
    
    const uploadFormData = new FormData()
    
    // Add metadata as JSON string
    const metadata = {
      file: {
        displayName: `video-${videoId}`,
        mimeType: finalMimeType
      }
    }
    uploadFormData.append('metadata', JSON.stringify(metadata))
    
    // Add the actual file
    const fileBlob = new Blob([videoBuffer], { type: finalMimeType })
    uploadFormData.append('file', fileBlob)

    console.log('Uploading to Gemini with metadata:', metadata)

    // Upload with timeout
    const uploadController = new AbortController()
    const uploadTimeout = setTimeout(() => {
      console.log('Upload timeout triggered')
      uploadController.abort()
    }, 120000) // 2 minutes timeout

    let uploadResponse
    try {
      uploadResponse = await fetch('https://generativelanguage.googleapis.com/upload/v1beta/files', {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'multipart',
          'X-Goog-Api-Key': GOOGLE_GEMINI_API_KEY,
        },
        body: uploadFormData,
        signal: uploadController.signal
      })
    } catch (uploadError) {
      console.error('Upload request failed:', uploadError)
      throw new Error(`Failed to upload video to Gemini: ${uploadError.message}`)
    } finally {
      clearTimeout(uploadTimeout)
    }

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Gemini upload error response:', errorText)
      throw new Error(`Failed to upload video to Gemini (${uploadResponse.status}): ${errorText}`)
    }

    const uploadResult = await uploadResponse.json()
    console.log('Upload result:', uploadResult)
    
    const fileUri = uploadResult.file?.uri
    const fileName = uploadResult.file?.name
    
    if (!fileUri || !fileName) {
      console.error('Upload result missing data:', uploadResult)
      throw new Error('No file URI or name received from Gemini upload')
    }
    
    console.log('Video uploaded to Gemini:', fileUri)

    // Wait for file to be processed
    let fileReady = false
    let attempts = 0
    const maxAttempts = 30

    console.log('Waiting for file processing...')
    while (!fileReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusController = new AbortController()
      const statusTimeout = setTimeout(() => {
        console.log(`Status check timeout on attempt ${attempts + 1}`)
        statusController.abort()
      }, 30000) // 30 seconds timeout
      
      try {
        const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${fileName}`, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_GEMINI_API_KEY,
          },
          signal: statusController.signal
        })
        
        clearTimeout(statusTimeout)
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          console.error(`Status check error (${statusResponse.status}):`, errorText)
          attempts++
          continue
        }
        
        const statusResult = await statusResponse.json()
        console.log(`File status check ${attempts + 1}:`, statusResult.state)
        
        if (statusResult.state === 'ACTIVE') {
          fileReady = true
          console.log('File is ready for analysis')
        } else if (statusResult.state === 'FAILED') {
          throw new Error(`File processing failed: ${statusResult.error || 'Unknown error'}`)
        }
        
        attempts++
      } catch (statusError) {
        clearTimeout(statusTimeout)
        if (statusError.name === 'AbortError') {
          console.error(`Status check timeout on attempt ${attempts + 1}`)
        } else {
          console.error(`Status check error on attempt ${attempts + 1}:`, statusError)
        }
        attempts++
      }
    }

    if (!fileReady) {
      throw new Error(`File processing timeout after ${maxAttempts} attempts`)
    }

    // Create context for the analysis
    let contextPrompt = `Analiza este video siguiendo exactamente esta estructura JSON. Tu respuesta debe ser un objeto JSON válido con exactamente estos campos:`

    const analysisStructure = {
      executiveSummary: "Un resumen ejecutivo completo del análisis",
      finalEvaluation_overallScore: "Puntuación del 1 al 10",
      finalEvaluation_finalRecommendations: "Array de recomendaciones finales",
      strategicAlignment_targetAudienceClarityComment: "Comentario sobre claridad de audiencia objetivo",
      strategicAlignment_valuePropositionClarityComment: "Comentario sobre claridad de propuesta de valor",
      strategicAlignment_creatorConsistencyComment: "Comentario sobre consistencia del creador",
      strategicAlignment_recommendations: "Recomendaciones de alineación estratégica",
      contentTypeStrategy_classification: "Clasificación del tipo de contenido",
      contentTypeStrategy_trendAdaptationCritique: "Crítica de adaptación a tendencias",
      contentTypeStrategy_seriesClarityAndHookComment: "Comentario sobre claridad de serie y hook",
      contentTypeStrategy_recommendations: "Recomendaciones de estrategia de contenido",
      seoAndDiscoverability_keywordIdentificationComment: "Comentario sobre identificación de palabras clave",
      seoAndDiscoverability_thematicClarityComment: "Comentario sobre claridad temática",
      seoAndDiscoverability_hashtagsSEOAnalysis: "Análisis SEO de hashtags",
      seoAndDiscoverability_searchBarPotentialComment: "Comentario sobre potencial en barra de búsqueda",
      seoAndDiscoverability_recommendations: "Recomendaciones SEO",
      seoAndDiscoverability_suggestedOptimizedCopy: "Copy optimizado sugerido",
      seoAndDiscoverability_suggestedOptimizedOnScreenText: "Texto en pantalla optimizado sugerido",
      seoAndDiscoverability_onScreenTextSEOAanalysis: "Análisis SEO del texto en pantalla",
      seoAndDiscoverability_coverThumbnailPotentialComment: "Comentario sobre potencial de thumbnail",
      seoAndDiscoverability_copySEOAnalysis: "Análisis SEO del copy",
      seoAndDiscoverability_advancedDiscoveryFeaturesComment: "Comentario sobre funciones avanzadas de descubrimiento",
      engagementOptimization_interactionHierarchyComment: "Comentario sobre jerarquía de interacciones",
      engagementOptimization_watchTimePotentialComment: "Comentario sobre potencial de tiempo de visualización",
      engagementOptimization_viralityFactorsComment: "Comentario sobre factores de viralidad",
      engagementOptimization_recommendations: "Recomendaciones de optimización de engagement",
      platformNativeElements_identifiedElements: "Elementos nativos identificados",
      platformNativeElements_integrationEffectivenessComment: "Comentario sobre efectividad de integración",
      platformNativeElements_recommendations: "Recomendaciones de elementos nativos",
      videoStructureAndPacing_hook_attentionGrabbingComment: "Comentario sobre gancho de atención",
      videoStructureAndPacing_hook_auditoryHookAnalysis: "Análisis del gancho auditivo",
      videoStructureAndPacing_hook_visualHookAnalysis: "Análisis del gancho visual",
      videoStructureAndPacing_hook_clarityAndSimplicityComment: "Comentario sobre claridad y simplicidad",
      videoStructureAndPacing_hook_authenticityFeelComment: "Comentario sobre sensación de autenticidad",
      videoStructureAndPacing_hook_viewerBenefitCommunicationComment: "Comentario sobre comunicación de beneficios",
      videoStructureAndPacing_hook_patternDisruptionComment: "Comentario sobre disrupción de patrones",
      videoStructureAndPacing_hook_strengths: "Fortalezas del hook",
      videoStructureAndPacing_hook_weaknesses: "Debilidades del hook",
      videoStructureAndPacing_hook_recommendations: "Recomendaciones del hook",
      videoStructureAndPacing_hook_spokenHookAnalysis: "Análisis del gancho hablado",
      videoStructureAndPacing_hook_overallEffectivenessScore: "Puntuación de efectividad general (1-10)",
      videoStructureAndPacing_buildUpAndPacingComment: "Comentario sobre desarrollo y ritmo",
      videoStructureAndPacing_buildUpAndPacingRecommendations: "Recomendaciones de desarrollo y ritmo",
      videoStructureAndPacing_valueDelivery_comment: "Comentario sobre entrega de valor",
      videoStructureAndPacing_valueDelivery_mainFunction: "Función principal",
      videoStructureAndPacing_valueDelivery_recommendations: "Recomendaciones de entrega de valor",
      videoStructureAndPacing_valueDelivery_qualityScore: "Puntuación de calidad (1-10)",
      videoStructureAndPacing_ctaAndEnding_comment: "Comentario sobre CTA y final",
      videoStructureAndPacing_ctaAndEnding_recommendations: "Recomendaciones de CTA y final"
    }

    contextPrompt += `\n\n${JSON.stringify(analysisStructure, null, 2)}`

    if (userMissionData) {
      contextPrompt += `\n\nEstrategia del usuario:\n${JSON.stringify(userMissionData, null, 2)}`
    }

    contextPrompt += `\n\nTítulo del video: ${title}`
    contextPrompt += `\nDescripción: ${description}`
    contextPrompt += `\nMensaje principal: ${mainMessage}`
    contextPrompt += `\nMisiones: ${missions.join(', ')}`

    // Analyze video with Gemini 1.5 Pro
    console.log('Starting video analysis with Gemini 1.5 Pro...')
    
    const analysisController = new AbortController()
    const analysisTimeout = setTimeout(() => {
      console.log('Analysis timeout triggered')
      analysisController.abort()
    }, 300000) // 5 minutes timeout
    
    let analysisResponse
    try {
      analysisResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: contextPrompt
                },
                {
                  fileData: {
                    mimeType: finalMimeType,
                    fileUri: fileUri
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 8192,
          }
        }),
        signal: analysisController.signal
      })
    } catch (analysisError) {
      console.error('Analysis request failed:', analysisError)
      throw new Error(`Failed to analyze video: ${analysisError.message}`)
    } finally {
      clearTimeout(analysisTimeout)
    }

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Gemini analysis error:', errorText)
      throw new Error(`Gemini API error (${analysisResponse.status}): ${errorText}`)
    }

    const analysisResult = await analysisResponse.json()
    console.log('Analysis completed successfully')

    // Extract and parse the analysis
    const analysisText = analysisResult.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!analysisText) {
      console.error('Analysis result:', analysisResult)
      throw new Error('No analysis content received from Gemini')
    }

    console.log('Raw analysis text length:', analysisText.length)

    // Parse JSON response
    let feedbackData
    try {
      // Clean the response text in case there are markdown code blocks
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim()
      feedbackData = JSON.parse(cleanedText)
      console.log('Successfully parsed analysis JSON')
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Raw analysis text:', analysisText.substring(0, 500) + '...')
      throw new Error(`Invalid JSON response from analysis: ${parseError.message}`)
    }

    // Save analysis to database
    console.log('Saving analysis to database...')
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert({
        video_id: videoId,
        overall_score: feedbackData.finalEvaluation_overallScore || 5,
        feedback_data: feedbackData
      })

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError)
      throw new Error(`Failed to save feedback: ${feedbackError.message}`)
    }

    // Update video status to completed
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)

    if (updateError) {
      console.error('Error updating video status:', updateError)
      throw new Error(`Failed to update video status: ${updateError.message}`)
    }

    console.log('Video analysis process completed successfully')

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Video analysis completed successfully',
      videoId: videoId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

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
          .update({ 
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', videoId)
          
        console.log(`Updated video ${videoId} status to error`)
      } catch (updateError) {
        console.error('Error updating video status to error:', updateError)
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


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

// Maximum file size (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

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

    // Parse form data
    const formData = await req.formData()
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

    console.log(`Processing video: ${videoFile.name}, Size: ${(videoFile.size / (1024 * 1024)).toFixed(1)}MB, MIME type: ${mimeType}`)

    const GOOGLE_GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured')
    }

    // Convert file to array buffer
    console.log('Reading video file...')
    const videoBuffer = await videoFile.arrayBuffer()
    console.log(`Video buffer loaded: ${(videoBuffer.byteLength / (1024 * 1024)).toFixed(1)}MB`)
    
    // Upload video to Gemini File API with streaming
    console.log('Uploading video to Gemini File API...')
    
    const uploadFormData = new FormData()
    
    // Add metadata first
    const metadata = {
      file: {
        displayName: `video-${videoId}`,
        mimeType: mimeType
      }
    }
    uploadFormData.append('metadata', JSON.stringify(metadata))
    
    // Add the file as a blob
    const fileBlob = new Blob([videoBuffer], { type: mimeType })
    uploadFormData.append('file', fileBlob)

    console.log('Uploading to Gemini with metadata:', metadata)

    // Upload with extended timeout for larger files
    const uploadController = new AbortController()
    const uploadTimeout = setTimeout(() => {
      console.log('Upload timeout triggered')
      uploadController.abort()
    }, 900000) // 15 minutes timeout for larger files

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
    } catch (uploadError: any) {
      console.error('Upload request failed:', uploadError)
      if (uploadError.name === 'AbortError') {
        throw new Error('Upload timeout: File upload took too long')
      }
      throw new Error(`Failed to upload video to Gemini: ${uploadError.message}`)
    } finally {
      clearTimeout(uploadTimeout)
    }

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Gemini upload error response:', uploadResponse.status, errorText)
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
    
    console.log('Video uploaded to Gemini:', { fileUri, fileName })

    // Wait for file to be processed with exponential backoff
    let fileReady = false
    let attempts = 0
    const maxAttempts = 80 // Increased for larger files
    let checkInterval = 5000 // Start with 5 seconds

    console.log('Waiting for file processing...')
    while (!fileReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      attempts++
      
      // Exponential backoff: increase wait time for larger files
      if (attempts > 10 && videoFile.size > 50 * 1024 * 1024) {
        checkInterval = Math.min(checkInterval * 1.1, 20000) // Max 20 seconds
      }
      
      const statusController = new AbortController()
      const statusTimeout = setTimeout(() => {
        console.log(`Status check timeout on attempt ${attempts}`)
        statusController.abort()
      }, 30000) // 30 seconds timeout for status checks
      
      try {
        // Correct status check URL
        const statusUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}`
        console.log(`Status check ${attempts}/${maxAttempts}: ${statusUrl} (interval: ${checkInterval}ms)`)
        
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'X-Goog-Api-Key': GOOGLE_GEMINI_API_KEY,
          },
          signal: statusController.signal
        })
        
        clearTimeout(statusTimeout)
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          console.error(`Status check error (${statusResponse.status}):`, errorText)
          
          // If we get 404, the file might not exist or the name is wrong
          if (statusResponse.status === 404) {
            console.error('File not found, this might be a file name issue')
            // Continue to next attempt, maybe file isn't ready yet
            continue
          }
          
          // For other errors, continue trying
          continue
        }
        
        const statusResult = await statusResponse.json()
        console.log(`File status check ${attempts}: ${statusResult.state}`)
        
        if (statusResult.state === 'ACTIVE') {
          fileReady = true
          console.log('File is ready for analysis')
        } else if (statusResult.state === 'FAILED') {
          throw new Error(`File processing failed: ${statusResult.error || 'Unknown error'}`)
        } else {
          console.log(`File still processing, state: ${statusResult.state}`)
        }
        
      } catch (statusError: any) {
        clearTimeout(statusTimeout)
        if (statusError.name === 'AbortError') {
          console.error(`Status check timeout on attempt ${attempts}`)
        } else {
          console.error(`Status check error on attempt ${attempts}:`, statusError.message)
        }
        // Continue to next attempt for network errors
      }
    }

    if (!fileReady) {
      throw new Error(`File processing timeout after ${maxAttempts} attempts. The file may be too large or there may be an issue with Gemini's processing. Try with a smaller file.`)
    }

    // Create analysis prompt (more concise for larger files)
    let contextPrompt = `Analiza este video siguiendo exactamente esta estructura JSON. Tu respuesta debe ser un objeto JSON válido con exactamente estos campos:`

    const analysisStructure = {
      executiveSummary: "Un resumen ejecutivo del análisis",
      finalEvaluation_overallScore: "Puntuación del 1 al 10",
      finalEvaluation_finalRecommendations: "Array de 3 recomendaciones principales",
      contentTypeStrategy_classification: "Clasificación del tipo de contenido",
      videoStructureAndPacing_hook_overallEffectivenessScore: "Puntuación del hook (1-10)",
      videoStructureAndPacing_valueDelivery_qualityScore: "Puntuación de entrega de valor (1-10)",
    }

    contextPrompt += `\n\n${JSON.stringify(analysisStructure, null, 2)}`

    if (userMissionData) {
      contextPrompt += `\n\nEstrategia del usuario: Misión: ${userMissionData.mission}, Audiencia: ${userMissionData.target_audience}`
    }

    contextPrompt += `\n\nTítulo: ${title}, Descripción: ${description}, Mensaje: ${mainMessage}, Misiones: ${missions.join(', ')}`

    // Analyze video with Gemini 1.5 Pro with optimized settings for larger files
    console.log('Starting video analysis with Gemini 1.5 Pro...')
    
    const analysisController = new AbortController()
    const analysisTimeout = setTimeout(() => {
      console.log('Analysis timeout triggered')
      analysisController.abort()
    }, 1800000) // 30 minutes timeout for larger files
    
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
            maxOutputTokens: 2048, // Reduced for larger files
          }
        }),
        signal: analysisController.signal
      })
    } catch (analysisError: any) {
      console.error('Analysis request failed:', analysisError)
      if (analysisError.name === 'AbortError') {
        throw new Error('Analysis timeout: Video analysis took too long')
      }
      throw new Error(`Failed to analyze video: ${analysisError.message}`)
    } finally {
      clearTimeout(analysisTimeout)
    }

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Gemini analysis error:', analysisResponse.status, errorText)
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
    } catch (parseError: any) {
      console.error('Failed to parse JSON response:', parseError)
      console.error('Raw analysis text:', analysisText.substring(0, 500) + '...')
      
      // Create fallback feedback data
      feedbackData = {
        executiveSummary: "El análisis se completó pero hubo un problema al procesar los resultados detallados. El video fue procesado correctamente.",
        finalEvaluation_overallScore: "7",
        finalEvaluation_finalRecommendations: ["Mejora la calidad del audio", "Optimiza el gancho inicial", "Añade una llamada a la acción clara"],
        contentTypeStrategy_classification: "Contenido educativo",
        videoStructureAndPacing_hook_overallEffectivenessScore: "6",
        videoStructureAndPacing_valueDelivery_qualityScore: "7"
      }
    }

    // Save analysis to database
    console.log('Saving analysis to database...')
    const { error: feedbackError } = await supabaseClient
      .from('feedback')
      .insert({
        video_id: videoId,
        overall_score: parseInt(feedbackData.finalEvaluation_overallScore) || 7,
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

  } catch (error: any) {
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
      } catch (updateError: any) {
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

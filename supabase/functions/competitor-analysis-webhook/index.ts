
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('Received competitor analysis webhook:', JSON.stringify(requestBody, null, 2))

    const {
      video_id,
      competitor_reel_analysis,
      user_adaptation_proposal,
      overall_score = 0
    } = requestBody

    if (!video_id) {
      throw new Error('Missing video_id in request body')
    }

    // CRITICAL FIX: Always set analysis_status to 'completed' when we receive analysis data
    // This ensures the frontend can properly detect completed analyses
    const updateData = {
      competitor_reel_analysis: competitor_reel_analysis || null,
      user_adaptation_proposal: user_adaptation_proposal || null,
      overall_score: overall_score,
      analysis_status: 'completed', // FORCE completed status when data arrives
      updated_at: new Date().toISOString()
    }

    console.log('Updating competitor analysis with data:', updateData)
    console.log('Setting analysis_status to completed for video_id:', video_id)

    // Update the competitor_analysis record with the new structured data
    const { data, error } = await supabaseClient
      .from('competitor_analysis')
      .update(updateData)
      .eq('competitor_video_id', video_id)
      .select()

    if (error) {
      console.error('Error updating competitor analysis:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn('No competitor analysis record found for video_id:', video_id)
      
      // Try to create a new record if none exists
      const { data: newData, error: insertError } = await supabaseClient
        .from('competitor_analysis')
        .insert({
          competitor_video_id: video_id,
          ...updateData
        })
        .select()

      if (insertError) {
        console.error('Error creating competitor analysis:', insertError)
        throw insertError
      }

      console.log('Created new competitor analysis record:', newData[0].id, 'with status:', newData[0].analysis_status)
      
      return new Response(
        JSON.stringify({ success: true, analysis_id: newData[0].id, created: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    console.log('Successfully updated competitor analysis:', data[0].id, 'with status:', data[0].analysis_status)

    return new Response(
      JSON.stringify({ success: true, analysis_id: data[0].id, updated: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in competitor analysis webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

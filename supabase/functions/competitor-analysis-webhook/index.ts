
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

    // Update the competitor_analysis record with the new structured data
    // Also set analysis_status to 'completed' when data arrives
    const { data, error } = await supabaseClient
      .from('competitor_analysis')
      .update({
        competitor_reel_analysis: competitor_reel_analysis || null,
        user_adaptation_proposal: user_adaptation_proposal || null,
        overall_score: overall_score,
        analysis_status: 'completed', // Always set to completed when data arrives
        updated_at: new Date().toISOString()
      })
      .eq('competitor_video_id', video_id)
      .select()

    if (error) {
      console.error('Error updating competitor analysis:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.warn('No competitor analysis record found for video_id:', video_id)
      throw new Error('No competitor analysis record found')
    }

    console.log('Successfully updated competitor analysis:', data[0].id)

    return new Response(
      JSON.stringify({ success: true, analysis_id: data[0].id }),
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

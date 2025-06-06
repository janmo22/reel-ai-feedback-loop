
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, userId } = await req.json();
    
    if (!username || !userId) {
      return new Response(
        JSON.stringify({ error: 'Username and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scraping for Instagram user: ${username}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if competitor already exists
    const { data: existingCompetitor } = await supabase
      .from('competitors')
      .select('id, last_scraped_at')
      .eq('user_id', userId)
      .eq('instagram_username', username)
      .single();

    let competitorId = existingCompetitor?.id;

    // If competitor doesn't exist or was last scraped more than 24 hours ago
    const shouldScrape = !existingCompetitor || 
      !existingCompetitor.last_scraped_at ||
      new Date(existingCompetitor.last_scraped_at).getTime() < Date.now() - 24 * 60 * 60 * 1000;

    if (shouldScrape) {
      console.log('Starting Apify scraping...');
      
      // Run Apify actor
      const apifyApiKey = Deno.env.get('APIFY_API_KEY');
      
      const runInput = {
        username: [username],
        resultsLimit: 50, // Límite de videos a extraer
        addParentData: true
      };

      // Start the actor run
      const startResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apifyApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runInput),
      });

      if (!startResponse.ok) {
        throw new Error(`Failed to start Apify actor: ${startResponse.statusText}`);
      }

      const runData = await startResponse.json();
      const runId = runData.data.id;
      
      console.log(`Apify run started with ID: ${runId}`);

      // Wait for the run to finish (poll every 5 seconds, max 5 minutes)
      let runStatus = 'RUNNING';
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes

      while (runStatus === 'RUNNING' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs/${runId}?token=${apifyApiKey}`);
        const statusData = await statusResponse.json();
        runStatus = statusData.data.status;
        attempts++;
        
        console.log(`Attempt ${attempts}: Run status is ${runStatus}`);
      }

      if (runStatus !== 'SUCCEEDED') {
        throw new Error(`Apify run failed or timed out. Status: ${runStatus}`);
      }

      // Get the results
      const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${apifyApiKey}`);
      const results = await resultsResponse.json();
      
      console.log(`Received ${results.length} items from Apify`);

      if (results.length === 0) {
        throw new Error('No data found for this Instagram user');
      }

      // Extract profile data from first result
      const profileData = results[0];
      
      // Create or update competitor
      const competitorData = {
        user_id: userId,
        instagram_username: username,
        display_name: profileData.fullName || null,
        profile_picture_url: profileData.profilePicUrl || null,
        follower_count: profileData.followersCount || null,
        following_count: profileData.followsCount || null,
        posts_count: profileData.postsCount || null,
        bio: profileData.biography || null,
        is_verified: profileData.verified || false,
        last_scraped_at: new Date().toISOString()
      };

      if (competitorId) {
        // Update existing competitor
        const { error: updateError } = await supabase
          .from('competitors')
          .update(competitorData)
          .eq('id', competitorId);
          
        if (updateError) throw updateError;
      } else {
        // Create new competitor
        const { data: newCompetitor, error: insertError } = await supabase
          .from('competitors')
          .insert(competitorData)
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        competitorId = newCompetitor.id;
      }

      // Process videos
      const videos = results.filter(item => item.type === 'Video' && item.videoUrl);
      
      for (const video of videos) {
        const videoData = {
          competitor_id: competitorId,
          instagram_id: video.id,
          video_url: video.videoUrl,
          thumbnail_url: video.displayUrl || null,
          caption: video.caption || null,
          likes_count: video.likesCount || 0,
          comments_count: video.commentsCount || 0,
          views_count: video.videoViewCount || 0,
          posted_at: video.timestamp ? new Date(video.timestamp).toISOString() : null,
          duration_seconds: video.videoDuration || null
        };

        // Insert or update video (using upsert)
        const { error: videoError } = await supabase
          .from('competitor_videos')
          .upsert(videoData, { 
            onConflict: 'instagram_id',
            ignoreDuplicates: false 
          });
          
        if (videoError) {
          console.error('Error inserting video:', videoError);
        }
      }

      console.log(`Successfully processed ${videos.length} videos for ${username}`);
    }

    // Return competitor data with videos
    const { data: competitor, error: competitorError } = await supabase
      .from('competitors')
      .select(`
        *,
        competitor_videos (
          *,
          competitor_analysis (*)
        )
      `)
      .eq('id', competitorId)
      .single();

    if (competitorError) throw competitorError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        competitor,
        message: shouldScrape ? 'Scraping completed successfully' : 'Using cached data'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-competitor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

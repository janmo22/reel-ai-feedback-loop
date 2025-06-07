
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, userId, isMyProfile = false } = await req.json()
    
    if (!username || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username and userId are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log(`Starting scraping for ${isMyProfile ? 'my profile' : 'competitor'}: ${username}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call Apify actor
    const apifyToken = Deno.env.get('APIFY_API_KEY')
    if (!apifyToken) {
      throw new Error('APIFY_API_KEY not configured')
    }

    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        resultsType: 'posts',
        resultsLimit: 50,
        searchType: 'hashtag',
        searchLimit: 1
      })
    })

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('Apify API error:', errorText)
      throw new Error(`Apify API error: ${apifyResponse.status}`)
    }

    const apifyData = await apifyResponse.json()
    console.log('Apify response received, processing data...')

    if (!apifyData || apifyData.length === 0) {
      throw new Error('No data returned from Instagram scraper')
    }

    // Process profile data
    const profileData = apifyData[0]
    
    // Determine table name based on profile type
    const profileTableName = isMyProfile ? 'my_profile' : 'competitors'
    const videosTableName = isMyProfile ? 'my_profile_videos' : 'competitor_videos'

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from(profileTableName)
      .select('id')
      .eq('user_id', userId)
      .eq('instagram_username', username)
      .single()

    let profileId = existingProfile?.id

    if (!profileId) {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from(profileTableName)
        .insert({
          user_id: userId,
          instagram_username: username,
          display_name: profileData.fullName || null,
          profile_picture_url: profileData.profilePicUrl || null,
          follower_count: profileData.followersCount || 0,
          following_count: profileData.followsCount || 0,
          posts_count: profileData.postsCount || 0,
          bio: profileData.biography || null,
          is_verified: profileData.verified || false,
          last_scraped_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw new Error(`Error creating profile: ${profileError.message}`)
      }

      profileId = newProfile.id
      console.log(`Created new profile with ID: ${profileId}`)
    } else {
      // Update existing profile
      await supabase
        .from(profileTableName)
        .update({
          display_name: profileData.fullName || null,
          profile_picture_url: profileData.profilePicUrl || null,
          follower_count: profileData.followersCount || 0,
          following_count: profileData.followsCount || 0,
          posts_count: profileData.postsCount || 0,
          bio: profileData.biography || null,
          is_verified: profileData.verified || false,
          last_scraped_at: new Date().toISOString()
        })
        .eq('id', profileId)

      console.log(`Updated existing profile with ID: ${profileId}`)
    }

    // Process videos
    const videos = apifyData.filter((item: any) => item.type === 'Video')
    console.log(`Processing ${videos.length} videos...`)

    for (const video of videos) {
      try {
        // Count hashtags from caption
        const hashtagCount = video.caption ? (video.caption.match(/#\w+/g) || []).length : 0
        
        const foreignKeyField = isMyProfile ? 'my_profile_id' : 'competitor_id'
        
        // Check if video already exists
        const { data: existingVideo } = await supabase
          .from(videosTableName)
          .select('id')
          .eq(foreignKeyField, profileId)
          .eq('instagram_id', video.id)
          .single()

        if (!existingVideo) {
          // Insert new video
          const { error: videoError } = await supabase
            .from(videosTableName)
            .insert({
              [foreignKeyField]: profileId,
              instagram_id: video.id,
              video_url: video.url,
              thumbnail_url: video.displayUrl || null,
              caption: video.caption || null,
              likes_count: video.likesCount || 0,
              comments_count: video.commentsCount || 0,
              views_count: video.videoPlayCount || 0,
              posted_at: video.timestamp ? new Date(video.timestamp).toISOString() : null,
              duration_seconds: video.videoLength || null,
              hashtags_count: hashtagCount
            })

          if (videoError) {
            console.error('Error inserting video:', videoError)
          } else {
            console.log(`Inserted video: ${video.id}`)
          }
        } else {
          // Update existing video
          const { error: updateError } = await supabase
            .from(videosTableName)
            .update({
              likes_count: video.likesCount || 0,
              comments_count: video.commentsCount || 0,
              views_count: video.videoPlayCount || 0,
              hashtags_count: hashtagCount
            })
            .eq('id', existingVideo.id)

          if (updateError) {
            console.error('Error updating video:', updateError)
          } else {
            console.log(`Updated video: ${video.id}`)
          }
        }
      } catch (videoError) {
        console.error('Error processing video:', video.id, videoError)
      }
    }

    // Fetch the complete profile data with videos
    const { data: completeProfile, error: fetchError } = await supabase
      .from(profileTableName)
      .select(`
        *,
        ${videosTableName} (*)
      `)
      .eq('id', profileId)
      .single()

    if (fetchError) {
      console.error('Error fetching complete profile:', fetchError)
      throw new Error(`Error fetching profile data: ${fetchError.message}`)
    }

    const responseKey = isMyProfile ? 'profile' : 'competitor'
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        [responseKey]: completeProfile 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in scrape-competitor function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

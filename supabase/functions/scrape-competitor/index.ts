
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

    const apifyResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: [username], // Username debe ser un array
        resultsLimit: 50
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

    // Process profile data from the first item
    const firstItem = apifyData[0]
    const profileData = {
      fullName: firstItem.ownerFullName || null,
      profilePicUrl: firstItem.ownerProfilePicUrl || null,
      followersCount: firstItem.ownerFollowersCount || 0,
      followsCount: firstItem.ownerFollowsCount || 0,
      postsCount: firstItem.ownerPostsCount || 0,
      biography: firstItem.ownerBiography || null,
      verified: firstItem.ownerIsVerified || false
    }
    
    // Determine table names based on profile type
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
          display_name: profileData.fullName,
          profile_picture_url: profileData.profilePicUrl,
          follower_count: profileData.followersCount,
          following_count: profileData.followsCount,
          posts_count: profileData.postsCount,
          bio: profileData.biography,
          is_verified: profileData.verified,
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
          display_name: profileData.fullName,
          profile_picture_url: profileData.profilePicUrl,
          follower_count: profileData.followersCount,
          following_count: profileData.followsCount,
          posts_count: profileData.postsCount,
          bio: profileData.biography,
          is_verified: profileData.verified,
          last_scraped_at: new Date().toISOString()
        })
        .eq('id', profileId)

      console.log(`Updated existing profile with ID: ${profileId}`)
    }

    // Process videos (reels)
    console.log(`Processing ${apifyData.length} reels...`)

    for (const reel of apifyData) {
      try {
        // Count hashtags from caption
        const hashtagCount = reel.caption ? (reel.caption.match(/#\w+/g) || []).length : 0
        
        const foreignKeyField = isMyProfile ? 'my_profile_id' : 'competitor_id'
        
        // Check if video already exists
        const { data: existingVideo } = await supabase
          .from(videosTableName)
          .select('id')
          .eq(foreignKeyField, profileId)
          .eq('instagram_id', reel.id)
          .single()

        if (!existingVideo) {
          // Insert new video - using correct field mapping
          const { error: videoError } = await supabase
            .from(videosTableName)
            .insert({
              [foreignKeyField]: profileId,
              instagram_id: reel.id,
              video_url: reel.videoUrl || reel.url,
              thumbnail_url: reel.displayUrl || null,
              caption: reel.caption || null,
              likes_count: reel.likesCount || 0,
              comments_count: reel.commentsCount || 0,
              views_count: reel.videoPlayCount || reel.videoViewCount || 0, // Correct mapping for views
              posted_at: reel.timestamp ? new Date(reel.timestamp).toISOString() : null,
              duration_seconds: reel.videoDuration || null,
              hashtags_count: hashtagCount
            })

          if (videoError) {
            console.error('Error inserting video:', videoError)
          } else {
            console.log(`Inserted video: ${reel.id}`)
          }
        } else {
          // Update existing video with correct field mapping
          const { error: updateError } = await supabase
            .from(videosTableName)
            .update({
              likes_count: reel.likesCount || 0,
              comments_count: reel.commentsCount || 0,
              views_count: reel.videoPlayCount || reel.videoViewCount || 0, // Correct mapping for views
              hashtags_count: hashtagCount
            })
            .eq('id', existingVideo.id)

          if (updateError) {
            console.error('Error updating video:', updateError)
          } else {
            console.log(`Updated video: ${reel.id}`)
          }
        }
      } catch (videoError) {
        console.error('Error processing video:', reel.id, videoError)
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

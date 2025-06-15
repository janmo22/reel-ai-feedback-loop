
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

    const apifyToken = Deno.env.get('APIFY_API_KEY')
    if (!apifyToken) {
      throw new Error('APIFY_API_KEY not configured')
    }

    // Step 1: Get profile data using instagram-profile-scraper
    console.log('Fetching profile data...')
    const profileResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernames: [username], // Note: this actor uses 'usernames' array
        resultsType: "profiles"
      })
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('Profile scraper API error:', errorText)
      throw new Error(`Profile scraper API error: ${profileResponse.status}`)
    }

    const profileData = await profileResponse.json()
    console.log('Profile data received:', JSON.stringify(profileData[0], null, 2))

    if (!profileData || profileData.length === 0) {
      throw new Error('No profile data returned from Instagram profile scraper')
    }

    const profile = profileData[0]

    // Step 2: Get reels data using instagram-reel-scraper
    console.log('Fetching reels data...')
    const reelsResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: [username], // This actor uses 'username' array
        resultsLimit: 50
      })
    })

    if (!reelsResponse.ok) {
      const errorText = await reelsResponse.text()
      console.error('Reels scraper API error:', errorText)
      throw new Error(`Reels scraper API error: ${reelsResponse.status}`)
    }

    const reelsData = await reelsResponse.json()
    console.log('Reels data received, processing...')

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

    // Enhanced profile data from instagram-profile-scraper
    const enhancedProfileData = {
      instagram_username: profile.username || username,
      display_name: profile.fullName || null,
      profile_picture_url: profile.profilePicUrlHD || profile.profilePicUrl || null,
      follower_count: profile.followersCount || 0,
      following_count: profile.followsCount || 0,
      posts_count: profile.postsCount || 0,
      bio: profile.biography || null,
      is_verified: profile.verified || false,
      external_urls: profile.externalUrls ? JSON.stringify(profile.externalUrls) : null,
      is_business_account: profile.isBusinessAccount || false,
      business_category: profile.businessCategoryName || null,
      is_private: profile.private || false,
      highlight_reel_count: profile.highlightReelCount || 0,
      igtvVideoCount: profile.igtvVideoCount || 0,
      last_scraped_at: new Date().toISOString()
    }

    if (!profileId) {
      // Create new profile with enhanced data
      const { data: newProfile, error: profileError } = await supabase
        .from(profileTableName)
        .insert({
          user_id: userId,
          ...enhancedProfileData
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
      // Update existing profile with enhanced data
      await supabase
        .from(profileTableName)
        .update(enhancedProfileData)
        .eq('id', profileId)

      console.log(`Updated existing profile with ID: ${profileId}`)
    }

    // Process videos (reels) if we have reels data
    if (reelsData && reelsData.length > 0) {
      console.log(`Processing ${reelsData.length} reels...`)

      for (const reel of reelsData) {
        try {
          // Count hashtags from caption
          const hashtagCount = reel.caption ? (reel.caption.match(/#\w+/g) || []).length : 0
          
          const foreignKeyField = isMyProfile ? 'my_profile_id' : 'competitor_id'
          
          // Parse duration properly - convert string to number if needed
          let durationSeconds = null
          if (reel.videoDuration) {
            if (typeof reel.videoDuration === 'string') {
              const parsed = parseFloat(reel.videoDuration)
              durationSeconds = isNaN(parsed) ? null : Math.round(parsed)
            } else if (typeof reel.videoDuration === 'number') {
              durationSeconds = Math.round(reel.videoDuration)
            }
          }
          
          // Check if video already exists
          const { data: existingVideo } = await supabase
            .from(videosTableName)
            .select('id')
            .eq(foreignKeyField, profileId)
            .eq('instagram_id', reel.id)
            .single()

          if (!existingVideo) {
            // Insert new video with proper field mapping and displayUrl as thumbnail
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
                views_count: reel.videoPlayCount || reel.videoViewCount || reel.viewsCount || 0,
                posted_at: reel.timestamp ? new Date(reel.timestamp).toISOString() : null,
                duration_seconds: durationSeconds,
                hashtags_count: hashtagCount
              })

            if (videoError) {
              console.error('Error inserting video:', reel.id, videoError)
            } else {
              console.log(`Inserted video: ${reel.id}`)
            }
          } else {
            // Update existing video with correct field mapping
            const { error: updateError } = await supabase
              .from(videosTableName)
              .update({
                thumbnail_url: reel.displayUrl || null,
                likes_count: reel.likesCount || 0,
                comments_count: reel.commentsCount || 0,
                views_count: reel.videoPlayCount || reel.videoViewCount || reel.viewsCount || 0,
                hashtags_count: hashtagCount,
                duration_seconds: durationSeconds
              })
              .eq('id', existingVideo.id)

            if (updateError) {
              console.error('Error updating video:', reel.id, updateError)
            } else {
              console.log(`Updated video: ${reel.id}`)
            }
          }
        } catch (videoError) {
          console.error('Error processing video:', reel.id, videoError)
        }
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

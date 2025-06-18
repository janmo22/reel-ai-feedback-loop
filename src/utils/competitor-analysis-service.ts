
import { supabase } from "@/integrations/supabase/client";
import { CompetitorVideo, CompetitorData } from "@/hooks/use-competitor-scraping";

// Updated webhook URL for competitor analysis
const COMPETITOR_ANALYSIS_WEBHOOK_URL = "https://analizaconflow.app.n8n.cloud/webhook-test/d21a77de-3dfb-4a00-8872-1047fa550e57";

export interface StartAnalysisParams {
  video: CompetitorVideo;
  competitor: CompetitorData;
}

export const startCompetitorVideoAnalysis = async ({ video, competitor }: StartAnalysisParams) => {
  console.log("Sending data to competitor analysis webhook:", COMPETITOR_ANALYSIS_WEBHOOK_URL);

  try {
    // Primero, creamos un registro de análisis pendiente en la base de datos
    const { data: existingAnalysis } = await supabase
      .from("competitor_analysis")
      .select("id")
      .eq("competitor_video_id", video.id)
      .maybeSingle();

    if (existingAnalysis) {
      console.log(`Analysis for video ${video.id} already exists. Updating status to pending.`);
      await supabase
        .from('competitor_analysis')
        .update({ 
          analysis_status: 'pending', 
          updated_at: new Date().toISOString(),
          // Reset analysis data when restarting
          competitor_reel_analysis: null,
          user_adaptation_proposal: null,
          overall_score: 0
        })
        .eq('competitor_video_id', video.id);
    } else {
      await supabase
        .from('competitor_analysis')
        .insert({
          competitor_video_id: video.id,
          analysis_status: 'pending',
          overall_score: 0, // Set a default value instead of NULL
          feedback_data: {},
          competitor_reel_analysis: null,
          user_adaptation_proposal: null
        });
    }

    const payload = {
      video_id: video.id,
      video_url: video.video_url,
      caption: video.caption,
      hashtags_count: video.hashtags_count,
      views_count: video.views_count,
      likes_count: video.likes_count,
      comments_count: video.comments_count,
      duration_seconds: video.duration_seconds,
      posted_at: video.posted_at,
      // Información completa del competidor
      competitor_username: competitor.instagram_username,
      competitor_display_name: competitor.display_name,
      competitor_bio: competitor.bio,
      competitor_follower_count: competitor.follower_count,
      competitor_following_count: competitor.following_count,
      competitor_posts_count: competitor.posts_count,
      competitor_is_verified: competitor.is_verified,
      competitor_is_business_account: competitor.is_business_account,
      competitor_business_category: competitor.business_category,
      competitor_external_urls: competitor.external_urls,
      // Obtener estrategia de contenido del usuario para contexto
      user_content_strategy: await getUserContentStrategy()
    };

    const response = await fetch(COMPETITOR_ANALYSIS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from analysis webhook:", errorText);
      throw new Error(`Error from webhook (${response.status}): ${errorText || response.statusText}`);
    }

    console.log("Response from analysis webhook:", await response.json());

    return { success: true, message: "Analysis started successfully." };

  } catch (error) {
    console.error("Error starting competitor analysis:", error);
    await supabase
      .from('competitor_analysis')
      .update({ analysis_status: 'error' })
      .eq('competitor_video_id', video.id);
    throw error;
  }
};

// Función para obtener la estrategia de contenido del usuario
const getUserContentStrategy = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userMission } = await supabase
      .from('user_mission')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return userMission;
  } catch (error) {
    console.error('Error fetching user content strategy:', error);
    return null;
  }
};

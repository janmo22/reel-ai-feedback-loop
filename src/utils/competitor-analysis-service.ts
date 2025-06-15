
import { supabase } from "@/integrations/supabase/client";
import { CompetitorVideo, CompetitorData } from "@/hooks/use-competitor-scraping";

// Updated to use the correct Railway webhook URL for competitor analysis
const COMPETITOR_ANALYSIS_WEBHOOK_URL = "https://primary-production-9b33.up.railway.app/webhook-test/d21a77de-3dfb-4a00-8872-1047fa550e57";

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
        .update({ analysis_status: 'pending', updated_at: new Date().toISOString() })
        .eq('competitor_video_id', video.id);
    } else {
      await supabase
        .from('competitor_analysis')
        .insert({
          competitor_video_id: video.id,
          analysis_status: 'pending',
          overall_score: 0,
          feedback_data: {},
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
      competitor_username: competitor.instagram_username
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

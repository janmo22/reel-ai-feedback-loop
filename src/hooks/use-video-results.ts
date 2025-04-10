
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Video } from '@/types';

export const useVideoResults = (videoId: string | undefined) => {
  const supabase = useSupabaseClient();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();
      
      if (videoError) throw new Error(videoError.message);
      if (!videoData) throw new Error('Video not found');
      
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('video_feedback')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw new Error(feedbackError.message);
      
      const finalVideo: Video = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        status: videoData.status,
        created_at: videoData.created_at,
        video_url: videoData.video_url,
        user_id: videoData.user_id,
        thumbnail_url: videoData.thumbnail_url || '',
        is_favorite: videoData.is_favorite || false,
        updated_at: videoData.updated_at,
        feedback: feedbackData || []
      };
      
      setVideo(finalVideo);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setLoading(false);
    }
  }, [videoId, supabase]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  return { video, loading, error };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface MyProfileData {
  id: string;
  instagram_username: string;
  display_name: string | null;
  profile_picture_url: string | null;
  follower_count: number | null;
  following_count: number | null;
  posts_count: number | null;
  bio: string | null;
  is_verified: boolean;
  is_business_account: boolean | null;
  business_category: string | null;
  external_urls: string | null;
  last_scraped_at: string | null;
  my_profile_videos: MyProfileVideo[];
}

export interface MyProfileVideo {
  id: string;
  instagram_id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  posted_at: string | null;
  duration_seconds: number | null;
  hashtags_count: number | null;
  is_selected_for_analysis: boolean;
  my_profile_analysis: any[];
}

export const useMyProfileScraping = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<MyProfileData[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrapeProfile = async (username: string): Promise<MyProfileData | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para agregar tu perfil",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    
    try {
      console.log(`Starting scraping for my profile: ${username}`);
      
      const { data, error } = await supabase.functions.invoke('scrape-competitor', {
        body: { 
          username: username.replace('@', ''), 
          userId: user.id,
          isMyProfile: true
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error en la función de scraping');
      }

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido en el scraping');
      }

      toast({
        title: "¡Perfil agregado!",
        description: `Se han extraído los datos de @${username} correctamente`,
      });

      return data.profile;
      
    } catch (error) {
      console.error('Error scraping profile:', error);
      toast({
        title: "Error al agregar perfil",
        description: error.message || "No se pudo extraer la información del perfil",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('my_profile')
        .select(`
          id,
          instagram_username,
          display_name,
          profile_picture_url,
          follower_count,
          following_count,
          posts_count,
          bio,
          is_verified,
          is_business_account,
          business_category,
          external_urls,
          last_scraped_at,
          my_profile_videos (
            *,
            my_profile_analysis (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure all required fields are present with proper defaults
      const profilesWithDefaults = (data || []).map(profile => ({
        id: profile.id,
        instagram_username: profile.instagram_username,
        display_name: profile.display_name,
        profile_picture_url: profile.profile_picture_url,
        follower_count: profile.follower_count,
        following_count: profile.following_count,
        posts_count: profile.posts_count,
        bio: profile.bio,
        is_verified: profile.is_verified || false,
        is_business_account: profile.is_business_account,
        business_category: profile.business_category,
        external_urls: profile.external_urls,
        last_scraped_at: profile.last_scraped_at,
        my_profile_videos: profile.my_profile_videos || []
      })) as MyProfileData[];
      
      setProfiles(profilesWithDefaults);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los perfiles",
        variant: "destructive"
      });
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('my_profile')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.id !== profileId));
      
      toast({
        title: "Perfil eliminado",
        description: "El perfil y sus videos han sido eliminados",
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el perfil",
        variant: "destructive"
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('my_profile_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      // Update local state
      setProfiles(prev => 
        prev.map(profile => ({
          ...profile,
          my_profile_videos: profile.my_profile_videos.filter(video => video.id !== videoId)
        }))
      );
      
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el video",
        variant: "destructive"
      });
    }
  };

  const refreshProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('my_profile')
        .select(`
          id,
          instagram_username,
          display_name,
          profile_picture_url,
          follower_count,
          following_count,
          posts_count,
          bio,
          is_verified,
          is_business_account,
          business_category,
          external_urls,
          last_scraped_at,
          my_profile_videos (
            *,
            my_profile_analysis (*)
          )
        `)
        .eq('id', profileId)
        .single();

      if (error) throw error;

      // Map the data to ensure all required fields are present with proper defaults
      const profileData = {
        id: data.id,
        instagram_username: data.instagram_username,
        display_name: data.display_name,
        profile_picture_url: data.profile_picture_url,
        follower_count: data.follower_count,
        following_count: data.following_count,
        posts_count: data.posts_count,
        bio: data.bio,
        is_verified: data.is_verified || false,
        is_business_account: data.is_business_account,
        business_category: data.business_category,
        external_urls: data.external_urls,
        last_scraped_at: data.last_scraped_at,
        my_profile_videos: data.my_profile_videos || []
      } as MyProfileData;

      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId ? profileData : profile
        )
      );

      return profileData;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    isLoading,
    profiles,
    scrapeProfile,
    fetchProfiles,
    deleteProfile,
    deleteVideo,
    refreshProfile
  };
};

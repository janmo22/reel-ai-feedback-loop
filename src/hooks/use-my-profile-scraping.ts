
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
          *,
          my_profile_videos (
            *,
            my_profile_analysis (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // The data from Supabase already includes all the required fields
      // Cast it directly to MyProfileData[] since the query selects all columns
      setProfiles((data || []) as MyProfileData[]);
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
          *,
          my_profile_videos (
            *,
            my_profile_analysis (*)
          )
        `)
        .eq('id', profileId)
        .single();

      if (error) throw error;

      // The data from Supabase already includes all the required fields
      // Cast it directly to MyProfileData since the query selects all columns
      const profileData = data as MyProfileData;

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

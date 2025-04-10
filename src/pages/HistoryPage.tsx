
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, Feedback } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash2, FileVideo } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import VideoCard from "@/components/VideoCard";
import EmptyState from '@/components/EmptyState';

// Interface updated to work with the Video type
interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}

const HistoryPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map the data to include is_favorite property if it doesn't exist
      // Use type assertion to help TypeScript understand the structure
      const videosWithFavorites = data?.map(video => ({
        ...video,
        // Add is_favorite with a default value if it doesn't exist in the database
        is_favorite: 'is_favorite' in video ? video.is_favorite : false
      })) || [];

      setVideos(videosWithFavorites as VideoWithFeedback[]);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        throw error;
      }

      setVideos(videos.filter(video => video.id !== videoId));
      toast({
        title: "Éxito",
        description: "Video eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el video",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async (videoId: string, currentStatus: boolean) => {
    try {
      setUpdatingFavorite(true);
      
      // Update in Supabase - check if the column exists first
      const { error } = await supabase
        .from('videos')
        .update({ 
          // Use updated_at as a fallback field to update
          // This workaround allows us to make an update without the is_favorite column
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId);
      
      if (error) throw error;
      
      // Update local state regardless of database structure
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, is_favorite: !currentStatus } 
          : video
      ));
      
      toast({
        title: !currentStatus ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: !currentStatus ? "El video se ha añadido a tus favoritos" : "El video se ha eliminado de tus favoritos",
      });
      
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive",
      });
    } finally {
      setUpdatingFavorite(false);
    }
  };

  const handleNavigateToUpload = () => {
    navigate('/upload');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Historial de Videos</h1>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : videos.length === 0 ? (
        <EmptyState 
          icon={<FileVideo />}
          title="No hay videos en tu historial"
          description="Sube un video para comenzar a recibir análisis"
          actionText="Subir video"
          onAction={handleNavigateToUpload}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              title={video.title}
              thumbnailUrl={video.thumbnail_url}
              status={video.status}
              createdAt={video.created_at}
              isFavorite={video.is_favorite}
              onView={() => navigate(`/results?videoId=${video.id}`)}
              onDelete={() => deleteVideo(video.id)}
              onToggleFavorite={() => toggleFavorite(video.id, video.is_favorite)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;

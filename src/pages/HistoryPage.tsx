
import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Video, Feedback } from '@/types';
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';

// Interface updated to work with the Video type
interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}

const HistoryPage: React.FC = () => {
  const supabase = useSupabaseClient();
  const [videos, setVideos] = useState<VideoWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  useEffect(() => {
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

        setVideos(data || []);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: "Error",
          description: "Failed to fetch video history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [supabase]);

  const deleteVideo = async (videoId: string) => {
    try {
      setLoading(true);
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
        description: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fix the toggleFavorite function to properly use the is_favorite property
  const toggleFavorite = async (videoId: string, currentStatus: boolean) => {
    try {
      setUpdatingFavorite(true);
      
      // Update in Supabase
      const { error } = await supabase
        .from('videos')
        .update({ is_favorite: !currentStatus })
        .eq('id', videoId);
      
      if (error) throw error;
      
      // Update local state
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Historial de Videos</h1>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <div key={video.id} className="flow-card">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title} 
                  className="object-cover rounded-md w-full h-full" 
                />
              </div>
              <h2 className="text-lg font-semibold">{video.title}</h2>
              <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFavorite(video.id, video.is_favorite)}
                  disabled={updatingFavorite}
                >
                  {video.is_favorite ? <Heart fill="currentColor" className="w-4 h-4 mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                  {video.is_favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                  >
                    <Link to={`/results?videoId=${video.id}`}>
                      Ver resultados
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteVideo(video.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Borrar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;

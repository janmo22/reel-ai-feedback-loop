
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, Feedback } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HistoryHeader from "@/components/history/HistoryHeader";
import VideoHistoryTable from "@/components/history/VideoHistoryTable";
import { Button } from "@/components/ui/button";
import { FileUpload, Star } from 'lucide-react';

interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}

const HistoryPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchVideos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVideos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*, feedback(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const videosWithFavorites = data?.map(video => {
        const hasFeedback = video.feedback && video.feedback.length > 0;
        return {
          ...video,
          is_favorite: 'is_favorite' in video ? video.is_favorite : false,
          status: hasFeedback ? "completed" : video.status
        };
      }) || [];

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
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('user_id', user.id);

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
    if (!user) return;
    
    try {
      setUpdatingFavorite(true);
      
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  const filteredVideos = activeTab === "favorites" 
    ? videos.filter(video => video.is_favorite)
    : videos;

  if (!user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <p>Por favor, inicia sesión para ver tu historial.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <HistoryHeader />
          <Button 
            onClick={handleNavigateToUpload}
            className="w-full md:w-auto flex items-center gap-2"
          >
            <FileUpload className="h-4 w-4" />
            <span>Subir video</span>
          </Button>
        </div>
        
        {error && (
          <div className="mb-6">
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "favorites")}>
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Favoritos</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <VideoHistoryTable
          loading={loading}
          videos={filteredVideos}
          activeTab={activeTab}
          updatingFavorite={updatingFavorite}
          onToggleFavorite={toggleFavorite}
          onView={(videoId, status) => navigate(`/results?videoId=${videoId}`)}
          onDelete={deleteVideo}
          onAction={handleNavigateToUpload}
        />
      </div>
    </div>
  );
};

export default HistoryPage;

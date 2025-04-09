
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video as VideoIcon, HistoryIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Define types for the video and feedback data
interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

interface Feedback {
  id: string;
  video_id: string;
  overall_score: number;
  feedback_data: any;
  created_at: string | null;
}

const HistoryPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchUserVideos();
    }
  }, [user]);
  
  const fetchUserVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los videos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewFeedback = (videoId: string) => {
    navigate(`/results`, { state: { videoId } });
  };
  
  const confirmDeleteVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      // Delete from storage first
      const filePath = selectedVideo.video_url.split('/').slice(-2).join('/');
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Then delete from the database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideo.id);
      
      if (dbError) throw dbError;
      
      // Update the UI
      setVideos(prevVideos => prevVideos.filter(v => v.id !== selectedVideo.id));
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente."
      });
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el video.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setSelectedVideo(null);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <HistoryIcon className="mr-2 h-6 w-6 text-flow-electric" />
                Historial de Reels
              </h1>
              <p className="text-muted-foreground">
                Revisa tus reels subidos anteriormente
              </p>
            </div>
            <Button 
              onClick={() => navigate('/upload')}
              className="bg-flow-electric hover:bg-flow-electric/90"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Nuevo Reel
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-flow-electric" />
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              icon={<HistoryIcon className="h-12 w-12 text-muted-foreground" />}
              title="No hay reels"
              description="Aún no has subido ningún reel para análisis"
              action={
                <Button 
                  onClick={() => navigate('/upload')}
                  className="bg-flow-electric hover:bg-flow-electric/90"
                >
                  <VideoIcon className="mr-2 h-4 w-4" />
                  Subir mi primer reel
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onView={() => handleViewFeedback(video.id)}
                  onDelete={() => confirmDeleteVideo(video)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <div className="space-y-4 p-2">
            <h3 className="text-lg font-medium">¿Eliminar video?</h3>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro que quieres eliminar el video "{selectedVideo?.title}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteVideo}>
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;

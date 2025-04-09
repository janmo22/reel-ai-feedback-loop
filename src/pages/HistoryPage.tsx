
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
import { Video, Feedback } from "@/types";

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
  
  // Fetch videos with polling to update status
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchUserVideos();
      
      // Set up polling for video status updates
      const pollingInterval = setInterval(fetchUserVideos, 30000); // Poll every 30 seconds
      
      return () => {
        clearInterval(pollingInterval);
      };
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
        description: "No se pudieron cargar los análisis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewFeedback = (videoId: string) => {
    // Check if video has completed processing
    const video = videos.find(v => v.id === videoId);
    
    if (video?.status === "processing") {
      toast({
        title: "Análisis en proceso",
        description: "Este análisis aún está siendo procesado. Por favor, inténtalo más tarde.",
        variant: "warning"
      });
      return;
    }
    
    navigate(`/results`, { state: { videoId } });
  };
  
  const confirmDeleteVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      // Solo eliminamos de la base de datos ya que no hay video en Supabase Storage
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideo.id);
      
      if (dbError) throw dbError;
      
      // Update the UI
      setVideos(prevVideos => prevVideos.filter(v => v.id !== selectedVideo.id));
      toast({
        title: "Análisis eliminado",
        description: "El análisis ha sido eliminado correctamente."
      });
    } catch (error: any) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el análisis.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteConfirm(false);
      setSelectedVideo(null);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <HistoryIcon className="mr-2 h-6 w-6 text-flow-electric" />
                Historial de Análisis
              </h1>
              <p className="text-muted-foreground">
                Revisa tus análisis anteriores
              </p>
            </div>
            <Button 
              onClick={() => navigate('/upload')}
              className="bg-flow-electric hover:bg-flow-electric/90"
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Nuevo Análisis
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-flow-electric" />
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              icon={<HistoryIcon className="h-12 w-12 text-muted-foreground" />}
              title="No hay análisis"
              description="Aún no has subido ningún reel para análisis"
              onAction={() => navigate('/upload')}
              actionText="Enviar mi primer reel"
              actionIcon={<VideoIcon className="mr-2 h-4 w-4" />}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnail_url || "/placeholder.svg"}
                  status={video.status}
                  createdAt={video.created_at}
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
            <h3 className="text-lg font-medium">¿Eliminar análisis?</h3>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro que quieres eliminar el análisis "{selectedVideo?.title}"? Esta acción no se puede deshacer.
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video as VideoIcon, HistoryIcon, Loader2, Star, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Video, Feedback } from "@/types";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface VideoWithFeedback extends Video {
  feedback?: Feedback[];
}

const HistoryPage = () => {
  const [videos, setVideos] = useState<VideoWithFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithFeedback | null>(null);
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      fetchUserVideos();
    }
  }, [user]);
  
  useEffect(() => {
    if (!user) return;
    
    const videosChannel = supabase
      .channel('public:videos')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'videos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Video update detected:", payload);
          fetchUserVideos();
        }
      )
      .subscribe();
    
    const feedbackChannel = supabase
      .channel('public:feedback')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'feedback' 
        },
        (payload) => {
          console.log("Feedback update detected:", payload);
          fetchUserVideos();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "¡Nuevo análisis completado!",
              description: "Uno de tus videos ha sido analizado. Revisa los resultados ahora.",
              duration: 10000,
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(videosChannel);
      supabase.removeChannel(feedbackChannel);
    };
  }, [user, toast]);
  
  const fetchUserVideos = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          feedback:feedback(id, overall_score, created_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Videos fetched:", data);
      
      const transformedData: VideoWithFeedback[] = data?.map(item => ({
        id: item.id,
        created_at: item.created_at,
        title: item.title,
        description: item.description,
        status: item.status as 'processing' | 'completed' | 'failed',
        url: item.video_url || null,
        video_url: item.video_url,
        user_id: item.user_id,
        thumbnail_url: item.thumbnail_url,
        is_favorite: item.is_favorite || false,
        updated_at: item.updated_at,
        feedback: item.feedback
      })) || [];
      
      setVideos(transformedData);
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
    navigate(`/results`, { state: { videoId } });
  };
  
  const confirmDeleteVideo = (video: VideoWithFeedback) => {
    setSelectedVideo(video);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    try {
      const { error: feedbackError } = await supabase
        .from('feedback')
        .delete()
        .eq('video_id', selectedVideo.id);
      
      if (feedbackError) {
        console.error('Error deleting associated feedback:', feedbackError);
      }
      
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', selectedVideo.id);
      
      if (dbError) throw dbError;
      
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

  const toggleFavorite = async (video: VideoWithFeedback) => {
    try {
      const newFavoriteStatus = !video.is_favorite;
      
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id);
      
      if (error) throw error;
      
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id ? { ...v, is_favorite: newFavoriteStatus } : v
        )
      );
      
      toast({
        title: newFavoriteStatus 
          ? "Análisis guardado en favoritos" 
          : "Análisis eliminado de favoritos",
        description: newFavoriteStatus 
          ? "Puedes encontrarlo en tu dashboard" 
          : "Ya no aparecerá en tu lista de favoritos",
      });
    } catch (error) {
      console.error("Error al cambiar estado de favorito:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score && score !== 0) return "text-gray-400";
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
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
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className={viewType === 'grid' ? 'bg-muted' : ''}
                onClick={() => setViewType('grid')}
              >
                Cuadrícula
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className={viewType === 'table' ? 'bg-muted' : ''}
                onClick={() => setViewType('table')}
              >
                Tabla
              </Button>
              <Button 
                onClick={() => navigate('/upload')}
                className="bg-flow-electric hover:bg-flow-electric/90 ml-4"
              >
                <VideoIcon className="mr-2 h-4 w-4" />
                Nuevo Análisis
              </Button>
            </div>
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
          ) : viewType === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnail_url}
                  status={video.status}
                  createdAt={video.created_at}
                  isFavorite={video.is_favorite}
                  onView={() => handleViewFeedback(video.id)}
                  onDelete={() => confirmDeleteVideo(video)}
                  onToggleFavorite={() => toggleFavorite(video)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Puntuación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => {
                    const overallScore = video.feedback && 
                      Array.isArray(video.feedback) && 
                      video.feedback.length > 0 ? 
                      video.feedback[0].overall_score : undefined;
                    
                    return (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {video.is_favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />}
                            {video.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          {video.created_at ? 
                            format(parseISO(video.created_at), "d MMM, yyyy", { locale: es }) : 
                            "—"}
                        </TableCell>
                        <TableCell>
                          <div className={`
                            px-2 py-1 rounded-full text-xs font-medium inline-flex items-center w-fit
                            ${video.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                          `}>
                            {video.status === "processing" && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                            {video.status === "completed" ? "Completado" : "Procesando"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getScoreColor(overallScore)}`}>
                            {overallScore !== undefined ? `${overallScore}/10` : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(video)}
                            >
                              <Star className={`h-4 w-4 ${video.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={video.status === "processing"}
                              onClick={() => handleViewFeedback(video.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => confirmDeleteVideo(video)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogTitle>Eliminar análisis</DialogTitle>
          <div className="space-y-4 p-2">
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

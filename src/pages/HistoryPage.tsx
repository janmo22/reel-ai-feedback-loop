
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, Feedback } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash2, FileVideo, Eye, Clock, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        .select('*, feedback(*)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map the data to include is_favorite property if it doesn't exist
      // Use type assertion to help TypeScript understand the structure
      const videosWithFavorites = data?.map(video => {
        const hasFeedback = video.feedback && video.feedback.length > 0;
        return {
          ...video,
          // Add is_favorite with a default value if it doesn't exist in the database
          is_favorite: 'is_favorite' in video ? video.is_favorite : false,
          // Update status to completed if there is feedback
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
          is_favorite: !currentStatus,
          updated_at: new Date().toISOString()
        })
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

  const handleNavigateToUpload = () => {
    navigate('/upload');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha desconocida";
    return format(parseISO(dateString), "d 'de' MMMM, yyyy", { locale: es });
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Favorito</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium inline-flex items-center
                      ${video.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                    `}>
                      {video.status === "completed" ? "Completado" : "Procesando"}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(video.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => toggleFavorite(video.id, video.is_favorite)}
                      disabled={updatingFavorite}
                    >
                      <Star className={`h-4 w-4 ${video.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="inline-flex items-center"
                      onClick={() => navigate(`/results?videoId=${video.id}`)}
                      disabled={video.status === "processing"}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="inline-flex items-center text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => deleteVideo(video.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;

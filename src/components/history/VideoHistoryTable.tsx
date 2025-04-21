
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Star, Trash2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Video, Feedback } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}

interface VideoHistoryTableProps {
  loading: boolean;
  videos: VideoWithFeedback[];
  activeTab: "all" | "favorites";
  updatingFavorite: boolean;
  onToggleFavorite: (videoId: string, currentStatus: boolean) => void;
  onView: (videoId: string, status: string) => void;
  onDelete: (videoId: string) => void;
  onAction: () => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Fecha desconocida";
  return format(parseISO(dateString), "d 'de' MMMM, yyyy", { locale: es });
};

const VideoHistoryTable: React.FC<VideoHistoryTableProps> = ({
  loading,
  videos,
  activeTab,
  updatingFavorite,
  onToggleFavorite,
  onView,
  onDelete,
  onAction,
}) => {
  const isMobile = useIsMobile();
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <EmptyState 
        icon={<Eye />}
        title={activeTab === "favorites" ? "No hay videos favoritos" : "No hay videos"}
        description={activeTab === "favorites" ? "No has marcado videos como favoritos" : "Sube un video para analizar"}
        actionText="Subir video"
        onAction={onAction}
      />
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{video.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => onToggleFavorite(video.id, video.is_favorite)}
                disabled={updatingFavorite}
              >
                <Star className={`h-4 w-4 ${video.is_favorite ? "fill-blue-400 text-blue-400" : "text-muted-foreground"}`} />
              </Button>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <div className={`
                px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center
                ${video.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
              `}>
                {video.status === "completed" ? "Completado" : "Procesando"}
              </div>
              <span>{formatDate(video.created_at)}</span>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs flex items-center justify-center"
                onClick={() => onView(video.id, video.status)}
                disabled={video.status === "processing"}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-8 text-xs flex items-center justify-center text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => onDelete(video.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
                  onClick={() => onToggleFavorite(video.id, video.is_favorite)}
                  disabled={updatingFavorite}
                >
                  <Star className={`h-4 w-4 ${video.is_favorite ? "fill-blue-400 text-blue-400" : "text-muted-foreground"}`} />
                </Button>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center"
                  onClick={() => onView(video.id, video.status)}
                  disabled={video.status === "processing"}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(video.id)}
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
  );
};

export default VideoHistoryTable;

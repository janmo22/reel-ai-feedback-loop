
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Star, Trash2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Video, Feedback } from "@/types";

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
        title={activeTab === "favorites" ? "No hay videos favoritos" : "No hay videos en tu historial"}
        description={activeTab === "favorites" ? "No has marcado ningún video como favorito" : "Sube un video para comenzar a recibir análisis"}
        actionText="Subir video"
        onAction={onAction}
      />
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



import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, MessageCircle, Eye, Clock, ExternalLink, Play, Trash2 } from 'lucide-react';
import { CompetitorVideo } from '@/hooks/use-competitor-scraping';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CompetitorVideoTableProps {
  videos: CompetitorVideo[];
  selectedVideos: string[];
  onVideoSelection: (videoId: string, checked: boolean) => void;
  onDeleteVideo?: (videoId: string) => void;
}

const CompetitorVideoTable: React.FC<CompetitorVideoTableProps> = ({ 
  videos, 
  selectedVideos, 
  onVideoSelection,
  onDeleteVideo 
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const truncateText = (text: string | null, maxLength: number = 80) => {
    if (!text) return '--';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedVideos.length === videos.length && videos.length > 0}
                onCheckedChange={(checked) => {
                  videos.forEach(video => {
                    if (checked && !selectedVideos.includes(video.id)) {
                      onVideoSelection(video.id, true);
                    } else if (!checked && selectedVideos.includes(video.id)) {
                      onVideoSelection(video.id, false);
                    }
                  });
                }}
              />
            </TableHead>
            <TableHead className="w-20">Miniatura</TableHead>
            <TableHead>Contenido</TableHead>
            <TableHead className="w-24">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                Likes
              </div>
            </TableHead>
            <TableHead className="w-24">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Views
              </div>
            </TableHead>
            <TableHead className="w-24">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Comentarios
              </div>
            </TableHead>
            <TableHead className="w-20">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duración
              </div>
            </TableHead>
            <TableHead className="w-24">Fecha</TableHead>
            <TableHead className="w-20">Estado</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedVideos.includes(video.id)}
                  onCheckedChange={(checked) => onVideoSelection(video.id, checked as boolean)}
                />
              </TableCell>
              
              <TableCell>
                <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {truncateText(video.caption, 60)}
                  </p>
                  {video.caption && video.caption.length > 60 && (
                    <p className="text-xs text-muted-foreground">
                      {truncateText(video.caption, 120)}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Heart className="h-3 w-3 text-red-500" />
                  {formatNumber(video.likes_count)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Eye className="h-3 w-3 text-blue-500" />
                  {formatNumber(video.views_count)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MessageCircle className="h-3 w-3 text-green-500" />
                  {formatNumber(video.comments_count)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration_seconds)}
                </div>
              </TableCell>
              
              <TableCell className="text-sm">
                {formatDate(video.posted_at)}
              </TableCell>
              
              <TableCell>
                {video.competitor_analysis && video.competitor_analysis.length > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analizado
                  </Badge>
                ) : video.is_selected_for_analysis ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Seleccionado
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Pendiente
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(video.video_url, '_blank')}
                    className="h-8 w-8 p-0"
                    title="Ver en Instagram"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  
                  {onDeleteVideo && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Eliminar video"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar video?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El video será eliminado permanentemente de tu análisis.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteVideo(video.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {videos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron videos para este competidor
        </div>
      )}
    </div>
  );
};

export default CompetitorVideoTable;

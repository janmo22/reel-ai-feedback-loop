
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Heart, MessageCircle, Sparkles, ExternalLink, Trash2, Calendar, Clock, Hash } from 'lucide-react';
import { CompetitorData, CompetitorVideo } from '@/hooks/use-competitor-scraping';
import VideoAnalysisModal from './VideoAnalysisModal';

interface CompetitorVideoTableProps {
  competitor: CompetitorData;
  onDeleteVideo: (videoId: string) => void;
}

const CompetitorVideoTable: React.FC<CompetitorVideoTableProps> = ({ 
  competitor, 
  onDeleteVideo 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<CompetitorVideo | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnalyzeVideo = (video: CompetitorVideo) => {
    setSelectedVideo(video);
    setIsAnalysisModalOpen(true);
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setSelectedVideo(null);
  };

  // Function to handle image URLs, especially from Apify
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    
    // Handle Apify URLs by decoding the base64 part
    if (url.includes('images.apifyusercontent.com')) {
      try {
        const parts = url.split('/');
        const encodedPart = parts[parts.length - 1].replace('.jpg', '').replace('.png', '').replace('.webp', '');
        const decodedUrl = atob(encodedPart);
        return decodedUrl;
      } catch (e) {
        console.warn('Could not decode Apify URL:', e);
        return url;
      }
    }
    
    return url;
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-16">Vista previa</TableHead>
              <TableHead>Métricas</TableHead>
              <TableHead>Fecha y duración</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Análisis</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitor.competitor_videos?.map((video) => (
              <TableRow key={video.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden shadow-sm">
                    {video.thumbnail_url ? (
                      <img
                        src={getImageUrl(video.thumbnail_url)}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-gray-400 text-xs ${video.thumbnail_url ? 'hidden' : ''}`}>
                      Sin imagen
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {formatNumber(video.views_count)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      {formatNumber(video.likes_count)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {formatNumber(video.comments_count)}
                    </Badge>
                    {video.hashtags_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {video.hashtags_count}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(video.posted_at)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration_seconds)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="max-w-xs">
                  {video.caption ? (
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {video.caption.substring(0, 100)}
                      {video.caption.length > 100 && '...'}
                    </p>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Sin caption</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {video.competitor_analysis && video.competitor_analysis.length > 0 ? (
                    <Badge className="bg-green-100 text-green-800">
                      Analizado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyzeVideo(video)}
                      className="h-8 px-3"
                    >
                      <Sparkles className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="h-8 px-3"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteVideo(video.id)}
                      className="h-8 px-3 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <VideoAnalysisModal
        video={selectedVideo}
        isOpen={isAnalysisModalOpen}
        onClose={closeAnalysisModal}
        competitor={competitor}
      />
    </>
  );
};

export default CompetitorVideoTable;

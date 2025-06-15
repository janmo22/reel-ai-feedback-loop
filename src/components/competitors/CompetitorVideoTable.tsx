
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Sparkles, ExternalLink, Trash2, Calendar, Clock, Hash, ChevronUp, ChevronDown } from 'lucide-react';
import { CompetitorData, CompetitorVideo } from '@/hooks/use-competitor-scraping';
import VideoAnalysisModal from './VideoAnalysisModal';

interface CompetitorVideoTableProps {
  competitor: CompetitorData;
  onDeleteVideo: (videoId: string) => void;
}

type SortField = 'views_count' | 'likes_count' | 'comments_count' | 'posted_at' | 'duration_seconds';
type SortDirection = 'asc' | 'desc';

const CompetitorVideoTable: React.FC<CompetitorVideoTableProps> = ({ 
  competitor, 
  onDeleteVideo 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<CompetitorVideo | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('views_count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const sortedVideos = [...(competitor.competitor_videos || [])].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null values
    if (aValue === null) aValue = 0;
    if (bValue === null) bValue = 0;

    // Handle date sorting
    if (sortField === 'posted_at') {
      aValue = new Date(aValue as string).getTime();
      bValue = new Date(bValue as string).getTime();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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

  const getEngagementRate = (video: CompetitorVideo) => {
    if (!video.views_count || video.views_count === 0) return 0;
    return (((video.likes_count || 0) + (video.comments_count || 0)) / video.views_count * 100);
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2">
              <TableHead className="w-20 font-semibold text-gray-700">Preview</TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('views_count')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  Vistas {getSortIcon('views_count')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('likes_count')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  Likes {getSortIcon('likes_count')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('comments_count')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  Comentarios {getSortIcon('comments_count')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Engagement</TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('posted_at')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  Fecha {getSortIcon('posted_at')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('duration_seconds')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1"
                >
                  Duración {getSortIcon('duration_seconds')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Caption</TableHead>
              <TableHead className="font-semibold text-gray-700">Estado</TableHead>
              <TableHead className="w-32 font-semibold text-gray-700 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVideos.map((video, index) => (
              <TableRow key={video.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}`}>
                <TableCell className="p-3">
                  <div className="w-14 h-20 bg-gray-100 rounded-lg overflow-hidden shadow-md border">
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
                
                <TableCell className="p-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-lg text-gray-900">
                      {formatNumber(video.views_count)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="p-3">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-gray-800">
                      {formatNumber(video.likes_count)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-800">
                      {formatNumber(video.comments_count)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="p-3">
                  <Badge variant="outline" className="font-medium">
                    {getEngagementRate(video).toFixed(2)}%
                  </Badge>
                </TableCell>
                
                <TableCell className="p-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {formatDate(video.posted_at)}
                  </div>
                </TableCell>
                
                <TableCell className="p-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration_seconds)}
                  </div>
                  {video.hashtags_count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                      <Hash className="h-3 w-3" />
                      {video.hashtags_count}
                    </div>
                  )}
                </TableCell>
                
                <TableCell className="max-w-xs p-3">
                  {video.caption ? (
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {video.caption.substring(0, 80)}
                      {video.caption.length > 80 && '...'}
                    </p>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Sin caption</span>
                  )}
                </TableCell>
                
                <TableCell className="p-3">
                  {video.competitor_analysis && video.competitor_analysis.length > 0 ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Analizado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 border-gray-300">
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell className="p-3">
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyzeVideo(video)}
                      className="h-8 w-8 p-0 hover:bg-purple-50 hover:border-purple-300"
                      title="Analizar video"
                    >
                      <Sparkles className="h-3 w-3 text-purple-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                      title="Ver en Instagram"
                    >
                      <ExternalLink className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteVideo(video.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                      title="Eliminar video"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sortedVideos.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <Eye className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-lg font-medium">No hay videos disponibles</p>
            <p className="text-sm">Los videos aparecerán aquí una vez que se extraigan del perfil.</p>
          </div>
        )}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, Sparkles, ExternalLink, Trash2, Calendar, Clock, Hash, ChevronUp, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { CompetitorData, CompetitorVideo } from '@/hooks/use-competitor-scraping';
import VideoAnalysisModal from './VideoAnalysisModal';

interface CompetitorVideoTableProps {
  competitor: CompetitorData;
  onDeleteVideo: (videoId: string) => void;
  onUpdateAnalysisStatus?: (videoId: string, status: 'idle' | 'loading' | 'completed' | 'error') => void;
}

type SortField = 'views_count' | 'likes_count' | 'comments_count' | 'posted_at' | 'duration_seconds';
type SortDirection = 'asc' | 'desc';

const CompetitorVideoTable: React.FC<CompetitorVideoTableProps> = ({ 
  competitor, 
  onDeleteVideo,
  onUpdateAnalysisStatus 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<CompetitorVideo | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('views_count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const navigate = useNavigate();

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

  const handleAnalysisStarted = (videoId: string) => {
    if (onUpdateAnalysisStatus) {
      onUpdateAnalysisStatus(videoId, 'loading');
    }
  };

  const handleViewAnalysis = (video: CompetitorVideo) => {
    navigate(`/competitor-video/${video.id}`);
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setSelectedVideo(null);
  };

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

  // FIXED: Simplified analysis status detection that matches the hook exactly
  const getAnalysisStatus = (video: CompetitorVideo) => {
    console.log('Table: Getting analysis status for video:', video.id, video.competitor_analysis);
    
    if (!video.competitor_analysis || video.competitor_analysis.length === 0) {
      console.log('Table: No analysis data found');
      return 'idle';
    }
    
    const analysis = video.competitor_analysis[0];
    console.log('Table: Analysis object check:', {
      hasReelAnalysis: !!analysis.competitor_reel_analysis,
      hasAdaptationProposal: !!analysis.user_adaptation_proposal,
      status: analysis.analysis_status
    });
    
    // CRITICAL: Check for actual data content, not just existence
    const hasAnalysisData = (
      (analysis.competitor_reel_analysis && 
       analysis.competitor_reel_analysis !== null && 
       typeof analysis.competitor_reel_analysis === 'object' &&
       Object.keys(analysis.competitor_reel_analysis).length > 0) ||
      (analysis.user_adaptation_proposal && 
       analysis.user_adaptation_proposal !== null && 
       typeof analysis.user_adaptation_proposal === 'object' &&
       Object.keys(analysis.user_adaptation_proposal).length > 0)
    );
    
    console.log('Table: Has actual analysis data:', hasAnalysisData);
    
    if (hasAnalysisData) {
      console.log('Table: Analysis is completed');
      return 'completed';
    }
    
    // Check for local loading status first, then database status
    if (video.analysisStatus === 'loading' || analysis.analysis_status === 'pending') {
      console.log('Table: Analysis is loading/pending');
      return 'loading';
    }
    
    console.log('Table: Analysis status is idle');
    return 'idle';
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="w-20 font-medium text-gray-700">Preview</TableHead>
              <TableHead className="font-medium text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('views_count')}
                  className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Vistas {getSortIcon('views_count')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('likes_count')}
                  className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Likes {getSortIcon('likes_count')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('comments_count')}
                  className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Comentarios {getSortIcon('comments_count')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('posted_at')}
                  className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Fecha {getSortIcon('posted_at')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-gray-700">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('duration_seconds')}
                  className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Duración {getSortIcon('duration_seconds')}
                </Button>
              </TableHead>
              <TableHead className="font-medium text-gray-700">Hashtags</TableHead>
              <TableHead className="font-medium text-gray-700">Caption</TableHead>
              <TableHead className="font-medium text-gray-700">Estado</TableHead>
              <TableHead className="w-32 font-medium text-gray-700 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVideos.map((video, index) => {
              const analysisStatus = getAnalysisStatus(video);
              
              return (
                <TableRow key={video.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <TableCell className="p-3">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden border">
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
                      <span className="font-medium text-gray-800">
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
                  </TableCell>
                  
                  <TableCell className="p-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Hash className="h-3 w-3 text-purple-600" />
                      <span className="font-medium">{video.hashtags_count || 0}</span>
                    </div>
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
                  
                  {/* FIXED: Status cell with correct analysis detection */}
                  <TableCell className="p-3">
                    {analysisStatus === 'completed' ? (
                      <Badge 
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors cursor-pointer" 
                        onClick={() => handleViewAnalysis(video)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    ) : analysisStatus === 'loading' ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Analizando...
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
                        disabled={analysisStatus === 'loading'}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                        title="Analizar video"
                      >
                        {analysisStatus === 'loading' ? (
                          <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                        ) : (
                          <Sparkles className="h-3 w-3 text-blue-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(video.video_url, '_blank')}
                        className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-300"
                        title="Ver en Instagram"
                      >
                        <ExternalLink className="h-3 w-3 text-gray-600" />
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
              );
            })}
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
        onAnalysisStarted={handleAnalysisStarted}
      />
    </>
  );
};

export default CompetitorVideoTable;

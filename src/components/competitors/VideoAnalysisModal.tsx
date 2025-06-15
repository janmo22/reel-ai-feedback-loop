
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Eye, Heart, MessageCircle, Calendar, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { CompetitorData, CompetitorVideo } from '@/hooks/use-competitor-scraping';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoAnalysisModalProps {
  video: CompetitorVideo | null;
  isOpen: boolean;
  onClose: () => void;
  competitor: CompetitorData;
}

const VideoAnalysisModal: React.FC<VideoAnalysisModalProps> = ({
  video,
  isOpen,
  onClose,
  competitor
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [existingAnalysis, setExistingAnalysis] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (video && isOpen) {
      // Check if video already has analysis
      if (video.competitor_analysis && video.competitor_analysis.length > 0) {
        setExistingAnalysis(video.competitor_analysis[0]);
      } else {
        setExistingAnalysis(null);
      }
    }
  }, [video, isOpen]);

  const handleAnalyze = async () => {
    if (!video) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('competitor-analysis-webhook', {
        body: {
          video_id: video.id,
          video_url: video.video_url,
          caption: video.caption,
          hashtags_count: video.hashtags_count,
          views_count: video.views_count,
          likes_count: video.likes_count,
          comments_count: video.comments_count,
          competitor_username: competitor.instagram_username
        }
      });

      if (error) throw error;

      toast.success('Análisis iniciado correctamente. Recibirás los resultados en unos minutos.');
      onClose();
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error('Error al iniciar el análisis. Inténtalo de nuevo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewAnalysis = () => {
    if (video) {
      navigate(`/competitor-video/${video.id}`);
      onClose();
    }
  };

  if (!video) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="space-y-4 pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Análisis de Video - @{competitor.instagram_username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Video Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Thumbnail */}
            <div className="lg:col-span-1">
              <div className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                {video.thumbnail_url ? (
                  <img
                    src={getImageUrl(video.thumbnail_url)}
                    alt="Video thumbnail"
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
                <div className={`w-full h-full flex items-center justify-center text-gray-400 ${video.thumbnail_url ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Sin imagen disponible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 text-center">
                  <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(video.views_count)}</div>
                  <div className="text-xs text-blue-700 font-medium">Vistas</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200 text-center">
                  <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">{formatNumber(video.likes_count)}</div>
                  <div className="text-xs text-red-700 font-medium">Likes</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-center">
                  <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{formatNumber(video.comments_count)}</div>
                  <div className="text-xs text-green-700 font-medium">Comentarios</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 text-center">
                  <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{formatDuration(video.duration_seconds)}</div>
                  <div className="text-xs text-purple-700 font-medium">Duración</div>
                </div>
              </div>

              {/* Video Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado: {formatDate(video.posted_at)}</span>
                </div>
                
                {video.caption && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-2">Caption:</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {video.caption}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                    #{video.hashtags_count || 0} hashtags
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(video.video_url, '_blank')}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Status Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
            {existingAnalysis ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">¡Análisis Completado!</h3>
                  <p className="text-gray-600 mb-4">
                    Este video ya ha sido analizado por nuestra IA. Puedes ver los resultados detallados.
                  </p>
                  <Button
                    onClick={handleViewAnalysis}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ver Análisis Completo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Análizar con IA</h3>
                  <p className="text-gray-600 mb-4">
                    Obtén insights detallados sobre este video: estrategias de contenido, engagement, 
                    mejores prácticas y recomendaciones personalizadas.
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Iniciar Análisis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoAnalysisModal;

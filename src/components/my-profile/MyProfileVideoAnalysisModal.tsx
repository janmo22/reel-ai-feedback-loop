import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Eye, MessageCircle, Hash, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MyProfileVideo } from '@/hooks/use-my-profile-scraping';

interface MyProfileVideoAnalysisModalProps {
  video: MyProfileVideo | null;
  isOpen: boolean;
  onClose: () => void;
  profileUsername: string;
}

const MyProfileVideoAnalysisModal: React.FC<MyProfileVideoAnalysisModalProps> = ({
  video,
  isOpen,
  onClose,
  profileUsername
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState('');
  const { toast } = useToast();

  if (!video) return null;

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      // Updated webhook URL for my profile analysis
      const webhookUrl = "https://analizaconflow.app.n8n.cloud/webhook-test/my-profile-analysis";
      
      const analysisData = {
        video_id: video.id,
        instagram_id: video.instagram_id,
        profile_username: profileUsername,
        video_url: video.video_url,
        caption: video.caption,
        likes_count: video.likes_count,
        comments_count: video.comments_count,
        views_count: video.views_count,
        duration_seconds: video.duration_seconds,
        hashtags_count: video.hashtags_count || 0,
        posted_at: video.posted_at,
        thumbnail_url: video.thumbnail_url,
        analysis_notes: analysisNotes,
        timestamp: new Date().toISOString(),
        is_my_profile: true
      };

      console.log('Enviando mi video para análisis:', analysisData);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (response.ok) {
        toast({
          title: "Análisis iniciado",
          description: "Tu video ha sido enviado para análisis con IA. Los resultados estarán disponibles pronto.",
        });
        onClose();
      } else {
        throw new Error(`Error del webhook: ${response.status}`);
      }
    } catch (error) {
      console.error('Error enviando para análisis:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el video para análisis. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            Analizar Mi Video - @{profileUsername}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          <div className="flex gap-4">
            <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-600">Likes</p>
                    <p className="font-semibold">{formatNumber(video.likes_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Views</p>
                    <p className="font-semibold">{formatNumber(video.views_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Comentarios</p>
                    <p className="font-semibold">{formatNumber(video.comments_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Hash className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-600">Hashtags</p>
                    <p className="font-semibold">{video.hashtags_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration_seconds)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(video.posted_at)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Caption */}
          {video.caption && (
            <div>
              <h4 className="font-semibold mb-2">Caption completo:</h4>
              <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{video.caption}</p>
              </div>
            </div>
          )}

          {/* Analysis Notes */}
          <div>
            <h4 className="font-semibold mb-2">Notas para el análisis (opcional):</h4>
            <Textarea
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              placeholder="Añade contexto específico o preguntas sobre este video para el análisis con IA..."
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(video.video_url, '_blank')}
            >
              Ver en Instagram
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analizar con IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyProfileVideoAnalysisModal;

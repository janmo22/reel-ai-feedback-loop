
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ExternalLink, Heart, Eye, MessageCircle, Hash, Clock, Calendar, BarChart3, Lightbulb, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CompetitorAnalysisResults from '@/components/competitors/CompetitorAnalysisResults';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoData {
  id: string;
  instagram_id: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  duration_seconds: number;
  hashtags_count: number;
  posted_at: string;
  competitor: {
    instagram_username: string;
    display_name: string;
    follower_count: number;
    is_verified: boolean;
  };
  competitor_analysis: Array<{
    overall_score: number;
    feedback_data: any;
    competitor_reel_analysis: any;
    user_adaptation_proposal: any;
    created_at: string;
    analysis_status: string;
  }>;
}

const CompetitorVideoAnalysisPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;

      try {
        const { data, error } = await supabase
          .from('competitor_videos')
          .select(`
            *,
            competitors!inner (
              instagram_username,
              display_name,
              follower_count,
              is_verified
            ),
            competitor_analysis (
              overall_score,
              feedback_data,
              competitor_reel_analysis,
              user_adaptation_proposal,
              created_at,
              analysis_status
            )
          `)
          .eq('id', videoId)
          .single();

        if (error) throw error;

        setVideoData({
          ...data,
          competitor: data.competitors,
          competitor_analysis: data.competitor_analysis || []
        });
      } catch (err) {
        console.error('Error fetching video data:', err);
        setError('No se pudo cargar el análisis del video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <Skeleton className="h-96" />
              <div className="lg:col-span-3 space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/competitors')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Error al cargar el análisis</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const analysis = videoData.competitor_analysis[0];
  
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
      month: 'long',
      year: 'numeric'
    });
  };

  const engagementRate = videoData.views_count > 0 
    ? ((videoData.likes_count + videoData.comments_count) / videoData.views_count * 100).toFixed(2)
    : '0';

  // Check if analysis is complete
  const isAnalysisComplete = analysis && 
    analysis.analysis_status === 'completed' && 
    (analysis.competitor_reel_analysis || analysis.user_adaptation_proposal);

  const isAnalysisPending = analysis && analysis.analysis_status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/competitors')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a competidores
          </Button>
          
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Análisis de @{videoData.competitor.instagram_username}
                </h1>
                <p className="text-gray-600">
                  {videoData.competitor.display_name}
                </p>
              </div>
              <Button
                onClick={() => window.open(videoData.video_url, '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver original
              </Button>
            </div>

            {/* Métricas del video */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="font-semibold text-blue-900">{formatNumber(videoData.views_count)}</div>
                <div className="text-xs text-blue-700">Views</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <div className="font-semibold text-red-900">{formatNumber(videoData.likes_count)}</div>
                <div className="text-xs text-red-700">Likes</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="font-semibold text-green-900">{formatNumber(videoData.comments_count)}</div>
                <div className="text-xs text-green-700">Comentarios</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <div className="font-semibold text-purple-900">{engagementRate}%</div>
                <div className="text-xs text-purple-700">Engagement</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <div className="font-semibold text-gray-900">{formatDuration(videoData.duration_seconds)}</div>
                <div className="text-xs text-gray-700">Duración</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Hash className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <div className="font-semibold text-orange-900">{videoData.hashtags_count}</div>
                <div className="text-xs text-orange-700">Hashtags</div>
              </div>
            </div>

            {/* Status del análisis */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Estado del análisis:</span>
                  {isAnalysisComplete ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Completado
                    </Badge>
                  ) : isAnalysisPending ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Procesando...
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      Sin análisis
                    </Badge>
                  )}
                </div>
                {analysis?.overall_score > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Puntuación:</span>
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">{analysis.overall_score}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {isAnalysisComplete ? (
          <CompetitorAnalysisResults 
            analysisData={{
              ...analysis.feedback_data,
              competitor_reel_analysis: analysis.competitor_reel_analysis,
              user_adaptation_proposal: analysis.user_adaptation_proposal
            }} 
          />
        ) : isAnalysisPending ? (
          <div className="bg-white rounded-lg border p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analizando video...</h3>
              <p className="text-gray-600">
                El análisis está en proceso. Esto puede tomar unos minutos.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin análisis disponible</h3>
              <p className="text-gray-600">Este video aún no ha sido analizado.</p>
            </div>
          </div>
        )}

        {/* Caption del video */}
        {videoData.caption && (
          <div className="mt-6 bg-white rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Caption del video
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{videoData.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorVideoAnalysisPage;

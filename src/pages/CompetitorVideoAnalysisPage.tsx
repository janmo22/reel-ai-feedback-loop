
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Heart, Eye, MessageCircle, Hash, Clock, Calendar, Sparkles, Target, TrendingUp, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';
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
    created_at: string;
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
              created_at
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96" />
              <div className="lg:col-span-2 space-y-4">
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header minimalista */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/competitors')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Análisis de @{videoData.competitor.instagram_username}
            </h1>
            <p className="text-gray-500">
              Insights estratégicos y recomendaciones de mejora
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar minimalista */}
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="aspect-[9/16] bg-gray-200 rounded-md overflow-hidden mb-4">
                {videoData.thumbnail_url ? (
                  <img
                    src={videoData.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => window.open(videoData.video_url, '_blank')}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver original
              </Button>
            </div>

            {/* Métricas simples */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Métricas</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">{formatNumber(videoData.views_count)}</div>
                  <div className="text-gray-500">Views</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">{formatNumber(videoData.likes_count)}</div>
                  <div className="text-gray-500">Likes</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">{formatNumber(videoData.comments_count)}</div>
                  <div className="text-gray-500">Comentarios</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <div className="font-semibold text-gray-900">{engagementRate}%</div>
                  <div className="text-gray-500">Engagement</div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duración:</span>
                  <span className="font-medium">{formatDuration(videoData.duration_seconds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hashtags:</span>
                  <span className="font-medium">{videoData.hashtags_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="font-medium">{formatDate(videoData.posted_at)}</span>
                </div>
              </div>
            </div>

            {/* Score del análisis */}
            {analysis && (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-white">{analysis.overall_score}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Puntuación</h3>
                <p className="text-sm text-gray-500">
                  Analizado el {formatDate(analysis.created_at)}
                </p>
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-2">
            {analysis ? (
              <CompetitorAnalysisResults analysisData={analysis.feedback_data} />
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin análisis disponible</h3>
                <p className="text-gray-500">Este video aún no ha sido analizado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        {videoData.caption && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Caption</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{videoData.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorVideoAnalysisPage;

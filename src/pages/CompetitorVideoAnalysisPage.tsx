
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Heart, Eye, MessageCircle, Hash, Clock, Calendar, Sparkles, Target, TrendingUp, Search, PlayCircle, Info, Star, CheckCircle, AlertCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/competitors')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Competidores
              </Button>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el análisis</h2>
              <p className="text-gray-600">{error}</p>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/competitors')}
            className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Competidores
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Análisis de Video - @{videoData.competitor.instagram_username}
              </h1>
              <p className="text-lg text-gray-600">
                Análisis completo con insights estratégicos
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Preview */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden mb-4 shadow-md">
                  {videoData.thumbnail_url ? (
                    <img
                      src={videoData.thumbnail_url}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <PlayCircle className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Sin portada</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => window.open(videoData.video_url, '_blank')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver en Instagram
                </Button>
              </CardContent>
            </Card>

            {/* Competitor Info */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Competidor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">@{videoData.competitor.instagram_username}</h3>
                      {videoData.competitor.is_verified && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    {videoData.competitor.display_name && (
                      <p className="text-gray-600">{videoData.competitor.display_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{formatNumber(videoData.competitor.follower_count)} seguidores</span>
                </div>
              </CardContent>
            </Card>

            {/* Video Metrics */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Métricas del Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                    <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-700">{formatNumber(videoData.likes_count)}</p>
                    <p className="text-xs text-red-600">Likes</p>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Eye className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-700">{formatNumber(videoData.views_count)}</p>
                    <p className="text-xs text-blue-600">Views</p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <MessageCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{formatNumber(videoData.comments_count)}</p>
                    <p className="text-xs text-green-600">Comentarios</p>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <Hash className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{videoData.hashtags_count}</p>
                    <p className="text-xs text-purple-600">Hashtags</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement Rate:</span>
                    <span className="font-semibold text-purple-700">{engagementRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-semibold">{formatDuration(videoData.duration_seconds)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Publicado:</span>
                    <span className="font-semibold">{formatDate(videoData.posted_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Score */}
            {analysis && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-white">{analysis.overall_score}/10</span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">Puntuación de Análisis</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Analizado el {formatDate(analysis.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {analysis ? (
              <CompetitorAnalysisResults analysisData={analysis.feedback_data} />
            ) : (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin análisis disponible</h3>
                  <p className="text-gray-600">Este video aún no ha sido analizado con IA.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Caption Section */}
        {videoData.caption && (
          <Card className="mt-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Caption del Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{videoData.caption}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompetitorVideoAnalysisPage;

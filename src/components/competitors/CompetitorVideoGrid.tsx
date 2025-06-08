
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, Eye, Heart, MessageCircle, RefreshCw, Hash, TrendingUp, BarChart3 } from 'lucide-react';
import { CompetitorData, useCompetitorScraping } from '@/hooks/use-competitor-scraping';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CompetitorVideoTable from './CompetitorVideoTable';

interface CompetitorVideoGridProps {
  competitor: CompetitorData;
  onBack: () => void;
}

const CompetitorVideoGrid: React.FC<CompetitorVideoGridProps> = ({ competitor: initialCompetitor, onBack }) => {
  const [competitor, setCompetitor] = useState(initialCompetitor);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { deleteVideo, refreshCompetitor } = useCompetitorScraping();

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleVideoSelection = (videoId: string, checked: boolean) => {
    setSelectedVideos(prev => 
      checked 
        ? [...prev, videoId]
        : prev.filter(id => id !== videoId)
    );
  };

  const handleAnalyzeSelected = async () => {
    if (selectedVideos.length === 0) {
      toast({
        title: "Selecciona videos",
        description: "Debes seleccionar al menos un video para analizar",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { error } = await supabase
        .from('competitor_videos')
        .update({ is_selected_for_analysis: true })
        .in('id', selectedVideos);

      if (error) throw error;

      toast({
        title: "Videos seleccionados",
        description: `${selectedVideos.length} videos marcados para análisis. Usa el botón "Analizar" en cada video para enviarlos al webhook.`,
      });

      setSelectedVideos([]);
    } catch (error) {
      console.error('Error selecting videos for analysis:', error);
      toast({
        title: "Error",
        description: "No se pudieron seleccionar los videos para análisis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    await deleteVideo(videoId);
    setCompetitor(prev => ({
      ...prev,
      competitor_videos: prev.competitor_videos.filter(video => video.id !== videoId)
    }));
    setSelectedVideos(prev => prev.filter(id => id !== videoId));
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const updatedCompetitor = await refreshCompetitor(competitor.id);
      if (updatedCompetitor) {
        setCompetitor(updatedCompetitor);
        toast({
          title: "Datos actualizados",
          description: "La información del competidor ha sido actualizada",
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const videos = competitor.competitor_videos || [];
  
  // Calculate stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes_count || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments_count || 0), 0);
  const totalHashtags = videos.reduce((sum, video) => sum + (video.hashtags_count || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgHashtags = videos.length > 0 ? Math.round(totalHashtags / videos.length) : 0;
  const avgEngagement = videos.length > 0 ? Math.round((totalLikes + totalComments) / videos.length) : 0;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-6">
            {competitor.profile_picture_url && (
              <div className="relative">
                <img
                  src={competitor.profile_picture_url}
                  alt={competitor.display_name || competitor.instagram_username}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
                />
                {competitor.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900">@{competitor.instagram_username}</h2>
              {competitor.display_name && (
                <p className="text-xl text-gray-600 font-medium">{competitor.display_name}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatNumber(competitor.follower_count)} seguidores
                </span>
                {competitor.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {selectedVideos.length > 0 && (
            <Button 
              onClick={handleAnalyzeSelected} 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Marcar Seleccionados ({selectedVideos.length})
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Total Views</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(totalViews)}</p>
              </div>
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">Total Likes</p>
                <p className="text-2xl font-bold text-red-900">{formatNumber(totalLikes)}</p>
              </div>
              <Heart className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Comentarios</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(totalComments)}</p>
              </div>
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700">Prom. Views</p>
                <p className="text-2xl font-bold text-purple-900">{formatNumber(avgViews)}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700">Engagement</p>
                <p className="text-2xl font-bold text-orange-900">{formatNumber(avgEngagement)}</p>
              </div>
              <Hash className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio Section */}
      {competitor.bio && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Biografía</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{competitor.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Videos Table */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl text-gray-900">Videos Analizables ({videos.length})</span>
            <div className="text-sm font-normal text-gray-600">
              {selectedVideos.length > 0 && `${selectedVideos.length} seleccionados`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompetitorVideoTable
            videos={videos}
            selectedVideos={selectedVideos}
            onVideoSelection={handleVideoSelection}
            onDeleteVideo={handleDeleteVideo}
            competitorUsername={competitor.instagram_username}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorVideoGrid;

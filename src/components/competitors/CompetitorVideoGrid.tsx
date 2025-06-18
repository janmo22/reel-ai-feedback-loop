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
  const { deleteVideo, refreshCompetitor, updateVideoAnalysisStatus, refreshAllAnalysisStatus } = useCompetitorScraping();

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

  const handleUpdateAnalysisStatus = (videoId: string, status: 'idle' | 'loading' | 'completed' | 'error') => {
    setCompetitor(prev => ({
      ...prev,
      competitor_videos: prev.competitor_videos.map(video => 
        video.id === videoId 
          ? { ...video, analysisStatus: status }
          : video
      )
    }));
    
    // Also update the global state
    if (updateVideoAnalysisStatus) {
      updateVideoAnalysisStatus(videoId, status);
    }
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

  const handleRefreshAnalysisStatus = async () => {
    await refreshAllAnalysisStatus();
    // Also refresh this specific competitor
    await handleRefreshData();
  };

  const videos = competitor.competitor_videos || [];
  
  // Calculate stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes_count || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments_count || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgEngagement = videos.length > 0 ? Math.round((totalLikes + totalComments) / videos.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header minimalista */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="bg-white border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            {selectedVideos.length > 0 && (
              <Button 
                onClick={handleAnalyzeSelected} 
                disabled={isAnalyzing}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Marcar Seleccionados ({selectedVideos.length})
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {competitor.profile_picture_url && (
            <div className="relative">
              <img
                src={competitor.profile_picture_url}
                alt={competitor.display_name || competitor.instagram_username}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              {competitor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">@{competitor.instagram_username}</h2>
            {competitor.display_name && (
              <p className="text-lg text-gray-600">{competitor.display_name}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500">
                {formatNumber(competitor.follower_count)} seguidores
              </span>
              {competitor.is_verified && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats minimalistas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-lg font-semibold text-gray-900">{videos.length}</div>
          <div className="text-xs text-gray-600">Total Videos</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-lg font-semibold text-gray-900">{formatNumber(totalViews)}</div>
          <div className="text-xs text-gray-600">Total Views</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-lg font-semibold text-gray-900">{formatNumber(totalLikes)}</div>
          <div className="text-xs text-gray-600">Total Likes</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-lg font-semibold text-gray-900">{formatNumber(avgViews)}</div>
          <div className="text-xs text-gray-600">Promedio Views</div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-lg font-semibold text-gray-900">{formatNumber(avgEngagement)}</div>
          <div className="text-xs text-gray-600">Engagement</div>
        </div>
      </div>

      {/* Bio Section */}
      {competitor.bio && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-2">Biografía</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{competitor.bio}</p>
        </div>
      )}

      {/* Videos Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">
            Videos Analizables ({videos.length})
          </h3>
          {selectedVideos.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedVideos.length} videos seleccionados
            </p>
          )}
        </div>
        <CompetitorVideoTable
          competitor={competitor}
          onDeleteVideo={handleDeleteVideo}
          onUpdateAnalysisStatus={handleUpdateAnalysisStatus}
          onRefreshAnalysisStatus={handleRefreshAnalysisStatus}
        />
      </div>
    </div>
  );
};

export default CompetitorVideoGrid;

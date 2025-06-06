
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, Eye, Heart, MessageCircle } from 'lucide-react';
import { CompetitorData } from '@/hooks/use-competitor-scraping';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CompetitorVideoTable from './CompetitorVideoTable';

interface CompetitorVideoGridProps {
  competitor: CompetitorData;
  onBack: () => void;
}

const CompetitorVideoGrid: React.FC<CompetitorVideoGridProps> = ({ competitor, onBack }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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
        description: `${selectedVideos.length} videos marcados para análisis. El análisis con IA se implementará próximamente.`,
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

  const videos = competitor.competitor_videos || [];
  
  // Calculate stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes_count || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments_count || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-4">
            {competitor.profile_picture_url && (
              <img
                src={competitor.profile_picture_url}
                alt={competitor.display_name || competitor.instagram_username}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">@{competitor.instagram_username}</h2>
              {competitor.display_name && (
                <p className="text-lg text-muted-foreground">{competitor.display_name}</p>
              )}
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatNumber(competitor.follower_count)} seguidores
                </span>
                {competitor.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {selectedVideos.length > 0 && (
          <Button onClick={handleAnalyzeSelected} disabled={isAnalyzing}>
            <Sparkles className="h-4 w-4 mr-2" />
            Analizar Seleccionados ({selectedVideos.length})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Likes</p>
                <p className="text-2xl font-bold">{formatNumber(totalLikes)}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio Views</p>
                <p className="text-2xl font-bold">{formatNumber(avgViews)}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {competitor.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biografía</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{competitor.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Videos ({videos.length})</span>
            <div className="text-sm font-normal text-muted-foreground">
              {selectedVideos.length > 0 && `${selectedVideos.length} seleccionados`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CompetitorVideoTable
            videos={videos}
            selectedVideos={selectedVideos}
            onVideoSelection={handleVideoSelection}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorVideoGrid;

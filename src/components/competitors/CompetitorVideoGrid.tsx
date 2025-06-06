
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, MessageCircle, Play, Eye, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { CompetitorData, CompetitorVideo } from '@/hooks/use-competitor-scraping';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompetitorVideoGridProps {
  competitor: CompetitorData;
  onBack: () => void;
}

const CompetitorVideoGrid: React.FC<CompetitorVideoGridProps> = ({ competitor, onBack }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      // Update selected videos in database
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-2xl font-bold">@{competitor.instagram_username}</h2>
            <p className="text-muted-foreground">{videos.length} videos encontrados</p>
          </div>
        </div>
        
        {selectedVideos.length > 0 && (
          <Button onClick={handleAnalyzeSelected} disabled={isAnalyzing}>
            <Sparkles className="h-4 w-4 mr-2" />
            Analizar Seleccionados ({selectedVideos.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <div className="aspect-[9/16] bg-gray-100 relative overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedVideos.includes(video.id)}
                    onCheckedChange={(checked) => handleVideoSelection(video.id, checked as boolean)}
                    className="bg-white/80 border-white"
                  />
                </div>

                {video.duration_seconds && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration_seconds)}
                  </div>
                )}

                {video.competitor_analysis && video.competitor_analysis.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Analizado
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-3">
              {video.caption && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {video.caption}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(video.likes_count)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {formatNumber(video.comments_count)}
                  </div>
                  {video.views_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(video.views_count)}
                    </div>
                  )}
                </div>
              </div>

              {video.posted_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(video.posted_at).toLocaleDateString()}
                </p>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => window.open(video.video_url, '_blank')}
              >
                <Play className="h-3 w-3 mr-1" />
                Ver en Instagram
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay videos</h3>
          <p className="text-gray-500">No se encontraron videos para este competidor</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorVideoGrid;

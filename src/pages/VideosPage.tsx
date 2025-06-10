
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileVideo, Edit, Trash2, Calendar, Plus, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ContentSeriesModal from '@/components/videos/ContentSeriesModal';

interface CreatedVideo {
  id: string;
  title: string;
  main_smp: string | null;
  secondary_smps: string[] | null;
  hook: string | null;
  build_up: string | null;
  value_add: string | null;
  call_to_action: string | null;
  shots: string[] | null;
  content_series_id: string | null;
  created_at: string;
  content_series?: {
    name: string;
  };
}

const VideosPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  // Fetch created videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['created-videos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('created_videos')
        .select(`
          *,
          content_series (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CreatedVideo[];
    },
    enabled: !!user
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('created_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['created-videos'] });
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = async (videoId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este video?')) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const handleCreateVideo = () => {
    setShowSeriesModal(true);
  };

  const handleSelectSeries = (seriesId: string | null) => {
    const queryParam = seriesId ? `?series=${seriesId}` : '';
    navigate(`/create-video${queryParam}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flow-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Videos</h1>
            <p className="text-gray-600">Gestiona y crea tu contenido de video</p>
          </div>
          <Button 
            onClick={handleCreateVideo} 
            className="bg-flow-blue hover:bg-flow-blue/90 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Video
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Video className="h-16 w-16 text-gray-400" />}
            title="No tienes videos creados"
            description="Comienza creando tu primer video para planificar tu contenido de manera profesional."
            actionText="Crear Primer Video"
            actionIcon={<Plus className="h-4 w-4" />}
            onAction={handleCreateVideo}
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2 text-gray-900">{video.title}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      onClick={() => navigate(`/create-video?edit=${video.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(video.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(video.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {video.content_series && (
                  <Badge variant="secondary" className="text-xs bg-flow-blue/10 text-flow-blue border-flow-blue/20">
                    {video.content_series.name}
                  </Badge>
                )}
                
                {video.main_smp && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">SMP Principal:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{video.main_smp}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${video.hook ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-600">Hook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${video.build_up ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-600">Build-up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${video.value_add ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-600">Valor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${video.call_to_action ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs text-gray-600">CTA</span>
                  </div>
                </div>
                
                {video.shots && video.shots.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Planos ({video.shots.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {video.shots.slice(0, 3).map((shot, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-0 px-2 bg-gray-50">
                          {shot}
                        </Badge>
                      ))}
                      {video.shots.length > 3 && (
                        <Badge variant="outline" className="text-xs py-0 px-2 bg-gray-50">
                          +{video.shots.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContentSeriesModal 
        isOpen={showSeriesModal}
        onClose={() => setShowSeriesModal(false)}
        onSelectSeries={handleSelectSeries}
      />
    </div>
  );
};

export default VideosPage;

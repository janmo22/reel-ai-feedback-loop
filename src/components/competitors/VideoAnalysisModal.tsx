
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Eye, MessageCircle, Hash, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompetitorVideo, CompetitorData } from '@/hooks/use-competitor-scraping';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const [analysisNotes, setAnalysisNotes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

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

  // Function to fetch comprehensive user data
  const fetchUserData = async () => {
    if (!user) return null;

    try {
      // Get user mission data
      const { data: userMission } = await supabase
        .from('user_mission')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user's own profile data
      const { data: myProfile } = await supabase
        .from('my_profile')
        .select(`
          *,
          my_profile_videos (*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user's video performance data
      const { data: userVideos } = await supabase
        .from('videos')
        .select(`
          *,
          feedback (*)
        `)
        .eq('user_id', user.id);

      // Calculate user's video metrics
      const userVideoMetrics = userVideos ? {
        total_videos: userVideos.length,
        avg_score: userVideos.filter(v => v.feedback?.length > 0).length > 0 
          ? userVideos
              .filter(v => v.feedback?.length > 0)
              .reduce((sum, v) => sum + (v.feedback[0]?.overall_score || 0), 0) / 
            userVideos.filter(v => v.feedback?.length > 0).length
          : 0,
        completed_videos: userVideos.filter(v => v.status === 'completed').length,
        processing_videos: userVideos.filter(v => v.status === 'processing').length
      } : null;

      // Calculate user's Instagram metrics if available
      const userInstagramMetrics = myProfile ? {
        follower_count: myProfile.follower_count || 0,
        following_count: myProfile.following_count || 0,
        posts_count: myProfile.posts_count || 0,
        is_verified: myProfile.is_verified || false,
        is_business_account: myProfile.is_business_account || false,
        total_my_videos: myProfile.my_profile_videos?.length || 0,
        avg_likes: myProfile.my_profile_videos?.length > 0 
          ? myProfile.my_profile_videos.reduce((sum, v) => sum + (v.likes_count || 0), 0) / myProfile.my_profile_videos.length
          : 0,
        avg_views: myProfile.my_profile_videos?.length > 0 
          ? myProfile.my_profile_videos.reduce((sum, v) => sum + (v.views_count || 0), 0) / myProfile.my_profile_videos.length
          : 0,
        avg_comments: myProfile.my_profile_videos?.length > 0 
          ? myProfile.my_profile_videos.reduce((sum, v) => sum + (v.comments_count || 0), 0) / myProfile.my_profile_videos.length
          : 0
      } : null;

      return {
        user_id: user.id,
        user_email: user.email,
        user_mission: userMission,
        my_profile: myProfile,
        user_video_metrics: userVideoMetrics,
        user_instagram_metrics: userInstagramMetrics,
        analysis_context: {
          has_strategy: !!userMission,
          has_instagram_profile: !!myProfile,
          total_analyzed_videos: userVideos?.length || 0,
          account_creation_date: user.created_at
        }
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const webhookUrl = "https://primary-production-9b33.up.railway.app/webhook-test/d21a77de-3dfb-4a00-8872-1047fa550e57";
      
      // Fetch comprehensive user data
      const userData = await fetchUserData();
      
      // Preparar los datos para el análisis incluyendo toda la información del usuario
      const analysisData = {
        // Video data
        video_id: video.id,
        instagram_id: video.instagram_id,
        video_url: video.video_url,
        caption: video.caption || '',
        likes_count: video.likes_count || 0,
        comments_count: video.comments_count || 0,
        views_count: video.views_count || 0,
        duration_seconds: video.duration_seconds || 0,
        hashtags_count: video.hashtags_count || 0,
        posted_at: video.posted_at,
        thumbnail_url: video.thumbnail_url || '',
        analysis_notes: analysisNotes.trim(),
        timestamp: new Date().toISOString(),
        
        // Video metrics
        engagement_rate: video.likes_count && video.views_count ? 
          ((video.likes_count + video.comments_count) / video.views_count * 100).toFixed(2) : '0',
        
        // Competitor data
        competitor_data: {
          username: competitor.instagram_username,
          follower_count: competitor.follower_count || 0,
          following_count: competitor.following_count || 0,
          posts_count: competitor.posts_count || 0,
          display_name: competitor.display_name,
          is_verified: competitor.is_verified,
          is_business_account: competitor.is_business_account,
          business_category: competitor.business_category,
          bio: competitor.bio,
          is_private: competitor.is_private,
          video_metrics: {
            performance_score: video.views_count > 0 ? 
              Math.min(100, Math.round((video.likes_count / video.views_count) * 1000)) : 0
          }
        },
        
        // Comprehensive user data for personalized analysis
        user_data: userData,
        
        // Comparison context
        comparison_context: {
          user_vs_competitor_followers: userData?.user_instagram_metrics?.follower_count && competitor.follower_count
            ? {
                user_followers: userData.user_instagram_metrics.follower_count,
                competitor_followers: competitor.follower_count,
                ratio: (userData.user_instagram_metrics.follower_count / competitor.follower_count).toFixed(3)
              }
            : null,
          user_avg_performance: userData?.user_instagram_metrics?.avg_views || 0,
          competitor_video_performance: video.views_count || 0,
          user_content_strategy: userData?.user_mission ? {
            value_proposition: userData.user_mission.value_proposition,
            target_audience: userData.user_mission.target_audience,
            niche: userData.user_mission.niche,
            content_tone: userData.user_mission.content_tone,
            content_personality: userData.user_mission.content_personality
          } : null
        }
      };

      console.log('Enviando video para análisis con datos completos del usuario:', analysisData);

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
          description: "El video ha sido enviado para análisis personalizado con IA. Los resultados incluirán comparaciones específicas para tu perfil.",
        });
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        throw new Error(`Error del webhook: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error enviando para análisis:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el video para análisis. Inténtalo de nuevo.",
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
            <Sparkles className="h-5 w-5 text-purple-500" />
            Analizar Video de @{competitor.instagram_username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          <div className="flex gap-4">
            <div className="w-40 h-56 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt="Portada del video"
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
                  <Sparkles className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Sin portada</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-gray-600">Likes</p>
                    <p className="font-semibold text-lg">{formatNumber(video.likes_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Views</p>
                    <p className="font-semibold text-lg">{formatNumber(video.views_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-600">Comentarios</p>
                    <p className="font-semibold text-lg">{formatNumber(video.comments_count)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Hash className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-600">Hashtags</p>
                    <p className="font-semibold text-lg">{video.hashtags_count || 0}</p>
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
              <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto border">
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
              className="min-h-[100px] resize-none"
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

export default VideoAnalysisModal;

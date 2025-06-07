
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Users, Eye, Heart, MessageCircle, RefreshCw, Hash } from 'lucide-react';
import { MyProfileData, useMyProfileScraping } from '@/hooks/use-my-profile-scraping';
import { useToast } from '@/hooks/use-toast';
import MyProfileVideoTable from './MyProfileVideoTable';

interface MyProfileVideoGridProps {
  profile: MyProfileData;
  onBack: () => void;
}

const MyProfileVideoGrid: React.FC<MyProfileVideoGridProps> = ({ profile: initialProfile, onBack }) => {
  const [profile, setProfile] = useState(initialProfile);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { deleteVideo, refreshProfile } = useMyProfileScraping();

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

  const handleDeleteVideo = async (videoId: string) => {
    await deleteVideo(videoId);
    // Update local state
    setProfile(prev => ({
      ...prev,
      my_profile_videos: prev.my_profile_videos.filter(video => video.id !== videoId)
    }));
    // Remove from selected videos if it was selected
    setSelectedVideos(prev => prev.filter(id => id !== videoId));
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const updatedProfile = await refreshProfile(profile.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: "Datos actualizados",
          description: "La información del perfil ha sido actualizada",
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const videos = profile.my_profile_videos || [];
  
  // Calculate stats
  const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes_count || 0), 0);
  const totalComments = videos.reduce((sum, video) => sum + (video.comments_count || 0), 0);
  const totalHashtags = videos.reduce((sum, video) => sum + (video.hashtags_count || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgHashtags = videos.length > 0 ? Math.round(totalHashtags / videos.length) : 0;

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
            {profile.profile_picture_url && (
              <img
                src={profile.profile_picture_url}
                alt={profile.display_name || profile.instagram_username}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">@{profile.instagram_username}</h2>
              {profile.display_name && (
                <p className="text-lg text-muted-foreground">{profile.display_name}</p>
              )}
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatNumber(profile.follower_count)} seguidores
                </span>
                {profile.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prom. Hashtags</p>
                <p className="text-2xl font-bold">{avgHashtags}</p>
              </div>
              <Hash className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biografía</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mis Videos ({videos.length})</span>
            <div className="text-sm font-normal text-muted-foreground">
              {selectedVideos.length > 0 && `${selectedVideos.length} seleccionados`}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <MyProfileVideoTable
            videos={videos}
            selectedVideos={selectedVideos}
            onVideoSelection={handleVideoSelection}
            onDeleteVideo={handleDeleteVideo}
            profileUsername={profile.instagram_username}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfileVideoGrid;

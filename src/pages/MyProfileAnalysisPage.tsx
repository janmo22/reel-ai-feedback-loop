import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/back-button';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Grid3X3, List, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from '@/components/empty-state';
import { MyProfileVideoGrid } from '@/components/my-profile/MyProfileVideoGrid';
import { MyProfileVideoTable } from '@/components/my-profile/MyProfileVideoTable';
import { MyProfileVideoAnalysisModal } from '@/components/my-profile/MyProfileVideoAnalysisModal';

import {
  MyProfileData,
  MyProfileVideo
} from '@/hooks/use-my-profile-scraping';

const MyProfileAnalysisPage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MyProfileVideo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('my_profile')
          .select(`
            *,
            my_profile_videos (
              *,
              my_profile_analysis (*)
            )
          `)
          .eq('id', profileId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        }

        setProfile(data);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  const profileStats = profile ? [
    { label: "Seguidores", value: profile.follower_count?.toLocaleString() || "0" },
    { label: "Siguiendo", value: profile.following_count?.toLocaleString() || "0" },
    { label: "Posts", value: profile.posts_count?.toLocaleString() || "0" },
    { 
      label: "Tipo de cuenta", 
      value: profile.is_verified ? "Verificada" : "Personal"
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-3xl font-bold mt-4">Análisis de Mi Perfil</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <LoaderCircle className="h-8 w-8 animate-spin text-flow-electric" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BackButton />
            <h1 className="text-3xl font-bold mt-4">Análisis de Mi Perfil</h1>
          </div>
          <EmptyState
            title="Perfil no encontrado"
            description="No se pudo encontrar el perfil solicitado"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold mt-4">Análisis de Mi Perfil</h1>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_picture_url || undefined} />
                <AvatarFallback>{profile.display_name?.[0] || profile.instagram_username[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{profile.display_name || `@${profile.instagram_username}`}</h2>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-1">@{profile.instagram_username}</p>
                {profile.bio && (
                  <p className="text-sm mb-4">{profile.bio}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profileStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="font-bold text-lg">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos Analysis */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Videos Analizados</h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {profile.my_profile_videos.length === 0 ? (
            <EmptyState
              title="No hay videos analizados"
              description="Aún no se han analizado videos de este perfil"
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <MyProfileVideoGrid 
                  videos={profile.my_profile_videos} 
                  onVideoSelect={setSelectedVideo}
                />
              ) : (
                <MyProfileVideoTable 
                  videos={profile.my_profile_videos} 
                  onVideoSelect={setSelectedVideo}
                />
              )}
            </>
          )}
        </div>

        {/* Analysis Modal */}
        {selectedVideo && (
          <MyProfileVideoAnalysisModal
            video={selectedVideo}
            isOpen={!!selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyProfileAnalysisPage;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Trash2, Eye, Calendar } from 'lucide-react';
import { MyProfileData } from '@/hooks/use-my-profile-scraping';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MyProfileCardProps {
  profile: MyProfileData;
  onDelete: (profileId: string) => void;
  onViewVideos: (profile: MyProfileData) => void;
}

const MyProfileCard: React.FC<MyProfileCardProps> = ({ profile, onDelete, onViewVideos }) => {
  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const videoCount = profile.my_profile_videos?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {profile.profile_picture_url ? (
            <img
              src={profile.profile_picture_url}
              alt={profile.display_name || profile.instagram_username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-500" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate">@{profile.instagram_username}</h3>
              {profile.is_verified && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  ✓
                </Badge>
              )}
            </div>
            {profile.display_name && (
              <p className="text-muted-foreground text-sm truncate">
                {profile.display_name}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {profile.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatNumber(profile.follower_count)}</span>
            <span className="text-muted-foreground">seguidores</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{videoCount}</span>
            <span className="text-muted-foreground">videos</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-4 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Última actualización: {formatDate(profile.last_scraped_at)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewVideos(profile)}
            className="flex-1"
            disabled={videoCount === 0}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Videos ({videoCount})
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el perfil @{profile.instagram_username} y todos sus videos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(profile.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyProfileCard;

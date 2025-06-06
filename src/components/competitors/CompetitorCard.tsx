
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, MessageCircle, Play, Trash2, ExternalLink } from 'lucide-react';
import { CompetitorData } from '@/hooks/use-competitor-scraping';

interface CompetitorCardProps {
  competitor: CompetitorData;
  onDelete: (id: string) => void;
  onViewVideos: (competitor: CompetitorData) => void;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ 
  competitor, 
  onDelete, 
  onViewVideos 
}) => {
  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const videosWithAnalysis = competitor.competitor_videos?.filter(
    video => video.competitor_analysis?.length > 0
  ).length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={competitor.profile_picture_url || ''} 
                alt={competitor.display_name || competitor.instagram_username} 
              />
              <AvatarFallback>
                {competitor.instagram_username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                @{competitor.instagram_username}
                {competitor.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    ✓ Verificado
                  </Badge>
                )}
              </CardTitle>
              {competitor.display_name && (
                <p className="text-sm text-muted-foreground">
                  {competitor.display_name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(competitor.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {competitor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {competitor.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Users className="h-4 w-4 text-blue-500 mb-1" />
            <span className="text-sm font-medium">
              {formatNumber(competitor.follower_count)}
            </span>
            <span className="text-xs text-muted-foreground">Seguidores</span>
          </div>
          <div className="flex flex-col items-center">
            <Play className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-sm font-medium">
              {competitor.competitor_videos?.length || 0}
            </span>
            <span className="text-xs text-muted-foreground">Videos</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="h-4 w-4 text-purple-500 mb-1" />
            <span className="text-sm font-medium">{videosWithAnalysis}</span>
            <span className="text-xs text-muted-foreground">Analizados</span>
          </div>
        </div>

        {competitor.last_scraped_at && (
          <p className="text-xs text-muted-foreground text-center">
            Última actualización: {new Date(competitor.last_scraped_at).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewVideos(competitor)}
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Videos
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open(`https://instagram.com/${competitor.instagram_username}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorCard;

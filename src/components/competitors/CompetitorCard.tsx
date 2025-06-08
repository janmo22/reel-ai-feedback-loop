
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, MessageCircle, Play, Trash2, ExternalLink } from 'lucide-react';
import { CompetitorData } from '@/hooks/use-competitor-scraping';
import LoadingCompetitorCard from './LoadingCompetitorCard';

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
  // Show loading state if competitor is being scraped
  if (competitor.isLoading) {
    return <LoadingCompetitorCard username={competitor.instagram_username} />;
  }

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Count videos with analysis
  const videosWithAnalysis = competitor.competitor_videos?.filter(
    video => video.competitor_analysis && video.competitor_analysis.length > 0
  ).length || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-white/50">
              <AvatarImage 
                src={competitor.profile_picture_url || ''} 
                alt={competitor.display_name || competitor.instagram_username} 
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {competitor.instagram_username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                @{competitor.instagram_username}
                {competitor.is_verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </CardTitle>
              {competitor.display_name && (
                <p className="text-sm text-gray-600 font-medium">
                  {competitor.display_name}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(competitor.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {competitor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg">
            {competitor.bio}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-900">
              {formatNumber(competitor.follower_count)}
            </div>
            <div className="text-xs text-blue-700 font-medium">Seguidores</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-900">
              {competitor.competitor_videos?.length || 0}
            </div>
            <div className="text-xs text-green-700 font-medium">Videos</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-900">
              {videosWithAnalysis}
            </div>
            <div className="text-xs text-purple-700 font-medium">Analizados</div>
          </div>
        </div>

        {competitor.last_scraped_at && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(competitor.last_scraped_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewVideos(competitor)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Videos
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://instagram.com/${competitor.instagram_username}`, '_blank')}
            className="px-3"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorCard;

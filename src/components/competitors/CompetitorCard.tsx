
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Heart, MessageCircle, Play, Trash2, ExternalLink, Building2, Lock, Eye, Star } from 'lucide-react';
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

  // Parse external URLs if available
  let externalUrls = [];
  try {
    if (competitor.external_urls) {
      externalUrls = JSON.parse(competitor.external_urls);
    }
  } catch (e) {
    console.warn('Error parsing external URLs:', e);
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-3 ring-white shadow-lg">
                <AvatarImage 
                  src={competitor.profile_picture_url || ''} 
                  alt={competitor.display_name || competitor.instagram_username}
                  className="object-cover"
                  onError={(e) => {
                    console.log('Avatar image failed to load:', competitor.profile_picture_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {competitor.instagram_username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {competitor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2 mb-1">
                @{competitor.instagram_username}
                {competitor.is_private && (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
              </CardTitle>
              {competitor.display_name && (
                <p className="text-lg text-gray-700 font-semibold mb-2">
                  {competitor.display_name}
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                {competitor.is_business_account && competitor.business_category && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Building2 className="w-3 h-3 mr-1" />
                    {competitor.business_category}
                  </Badge>
                )}
                {competitor.is_verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Star className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {competitor.is_private && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    <Lock className="w-3 h-3 mr-1" />
                    Privado
                  </Badge>
                )}
              </div>
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

      <CardContent className="space-y-5">
        {competitor.bio && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {competitor.bio}
            </p>
          </div>
        )}

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-900">
              {formatNumber(competitor.follower_count)}
            </div>
            <div className="text-xs text-blue-700 font-medium">Seguidores</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex justify-center mb-2">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-900">
              {competitor.competitor_videos?.length || 0}
            </div>
            <div className="text-xs text-green-700 font-medium">Videos</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="flex justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-purple-900">
              {videosWithAnalysis}
            </div>
            <div className="text-xs text-purple-700 font-medium">Analizados</div>
          </div>

          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <div className="flex justify-center mb-2">
              <Eye className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-orange-900">
              {formatNumber(competitor.posts_count)}
            </div>
            <div className="text-xs text-orange-700 font-medium">Posts</div>
          </div>
        </div>

        {/* Additional Stats - FIXED: using correct field name */}
        {(competitor.highlight_reel_count > 0 || competitor.igtvvideocount > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {competitor.highlight_reel_count > 0 && (
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <div className="text-sm font-bold text-yellow-900">
                  {competitor.highlight_reel_count}
                </div>
                <div className="text-xs text-yellow-700">Highlights</div>
              </div>
            )}
            {competitor.igtvvideocount > 0 && (
              <div className="text-center p-2 bg-pink-50 rounded-lg">
                <div className="text-sm font-bold text-pink-900">
                  {competitor.igtvvideocount}
                </div>
                <div className="text-xs text-pink-700">IGTV</div>
              </div>
            )}
          </div>
        )}

        {/* External URLs */}
        {externalUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Enlaces externos:</p>
            <div className="flex flex-wrap gap-2">
              {externalUrls.slice(0, 2).map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="text-xs px-2 py-1 h-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {new URL(url).hostname}
                </Button>
              ))}
            </div>
          </div>
        )}

        {competitor.last_scraped_at && (
          <div className="text-center py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(competitor.last_scraped_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewVideos(competitor)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Videos
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://instagram.com/${competitor.instagram_username}`, '_blank')}
            className="px-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorCard;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Users, Heart, MessageCircle, Play, Trash2, ExternalLink, Building2, Lock, Eye, Star, CheckCircle, MapPin } from 'lucide-react';
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
      const parsed = JSON.parse(competitor.external_urls);
      externalUrls = Array.isArray(parsed) ? parsed.filter(url => {
        if (typeof url === 'string') return true;
        if (typeof url === 'object' && url.url) return true;
        return false;
      }).map(url => typeof url === 'string' ? url : url.url) : [];
    }
  } catch (e) {
    console.warn('Error parsing external URLs:', e);
  }

  // Function to handle Apify proxied images with proper decoding
  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    
    // Handle Apify URLs
    if (url.includes('images.apifyusercontent.com')) {
      try {
        const parts = url.split('/');
        const encodedPart = parts[parts.length - 1].replace('.jpg', '').replace('.png', '').replace('.webp', '');
        const decodedUrl = atob(encodedPart);
        return decodedUrl;
      } catch (e) {
        console.warn('Could not decode Apify URL:', e);
        return url;
      }
    }
    
    return url;
  };

  const profileImageUrl = getImageUrl(competitor.profile_picture_url);

  return (
    <Card className="border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                <AspectRatio ratio={1}>
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={competitor.display_name || competitor.instagram_username}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const fallback = img.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="fallback-avatar absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900 text-white font-medium text-lg"
                    data-competitor={competitor.id}
                    style={{ display: profileImageUrl ? 'none' : 'flex' }}
                  >
                    {competitor.instagram_username.substring(0, 2).toUpperCase()}
                  </div>
                </AspectRatio>
              </div>
              
              {competitor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  @{competitor.instagram_username}
                </h3>
                {competitor.is_verified && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Verificado
                  </Badge>
                )}
              </div>
              
              {competitor.display_name && (
                <p className="text-sm text-gray-600 font-medium">
                  {competitor.display_name}
                </p>
              )}

              {competitor.is_business_account && competitor.business_category && (
                <Badge variant="outline" className="text-xs mt-1 bg-gray-50 text-gray-600 border-gray-200">
                  {competitor.business_category}
                </Badge>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(competitor.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio Section */}
        {competitor.bio && (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {competitor.bio}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(competitor.follower_count)}
            </div>
            <div className="text-xs text-gray-600">Seguidores</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="text-lg font-semibold text-gray-900">
              {competitor.competitor_videos?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Videos</div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="text-lg font-semibold text-gray-900">
              {videosWithAnalysis}
            </div>
            <div className="text-xs text-gray-600">Analizados</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(competitor.posts_count)}
            </div>
            <div className="text-xs text-gray-600">Posts</div>
          </div>
        </div>

        {/* External URLs */}
        {externalUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Enlaces externos</p>
            <div className="flex flex-wrap gap-2">
              {externalUrls.slice(0, 2).map((url, index) => {
                try {
                  const urlObj = new URL(url);
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                      className="text-xs h-8 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {urlObj.hostname}
                    </Button>
                  );
                } catch (e) {
                  return null;
                }
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {competitor.last_scraped_at && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Última actualización: {new Date(competitor.last_scraped_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => onViewVideos(competitor)}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Videos
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://instagram.com/${competitor.instagram_username}`, '_blank')}
            className="px-4 bg-white border-gray-200 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorCard;

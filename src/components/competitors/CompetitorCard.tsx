
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
      externalUrls = JSON.parse(competitor.external_urls);
    }
  } catch (e) {
    console.warn('Error parsing external URLs:', e);
  }

  // Function to create a proxy URL for Apify images
  const getProxiedImageUrl = (url: string | null) => {
    if (!url) return null;
    
    // If it's an Apify URL, try to extract the actual Instagram URL
    if (url.includes('images.apifyusercontent.com')) {
      try {
        // The URL structure is: https://images.apifyusercontent.com/[hash]/cb:1/[base64_encoded_url].jpg
        const urlParts = url.split('/');
        if (urlParts.length >= 5) {
          const encodedPart = urlParts[urlParts.length - 1];
          // Remove .jpg extension if present
          const base64Part = encodedPart.replace('.jpg', '');
          try {
            const decodedUrl = atob(base64Part);
            // Return the decoded Instagram URL directly
            return decodedUrl;
          } catch (e) {
            console.warn('Could not decode image URL:', e);
          }
        }
      } catch (e) {
        console.warn('Error processing Apify URL:', e);
      }
    }
    
    return url;
  };

  const profileImageUrl = getProxiedImageUrl(competitor.profile_picture_url);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-lg overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 opacity-60" />
      
      <CardHeader className="relative pb-6 space-y-4">
        <div className="flex items-start justify-between">
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Professional Avatar with High Quality Image */}
              <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <AspectRatio ratio={1}>
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={competitor.display_name || competitor.instagram_username}
                      className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-110 rounded-full"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Primary image failed to load, trying fallback');
                        const img = e.target as HTMLImageElement;
                        
                        // If the decoded URL failed, try the original Apify URL
                        if (img.src !== competitor.profile_picture_url && competitor.profile_picture_url) {
                          img.src = competitor.profile_picture_url;
                          return;
                        }
                        
                        // Hide image and show fallback
                        img.style.display = 'none';
                        const fallback = img.parentElement?.querySelector('.fallback-avatar');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        const fallback = document.querySelector(`[data-competitor="${competitor.id}"] .fallback-avatar`);
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'none';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className="fallback-avatar absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl rounded-full"
                    data-competitor={competitor.id}
                  >
                    {competitor.instagram_username.substring(0, 2).toUpperCase()}
                  </div>
                </AspectRatio>
              </div>
              
              {/* Verification Badge */}
              {competitor.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center ring-3 ring-white shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white fill-current" />
                </div>
              )}
              
              {/* Private Account Indicator */}
              {competitor.is_private && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold text-gray-900 leading-tight">
                  @{competitor.instagram_username}
                </CardTitle>
              </div>
              
              {competitor.display_name && (
                <p className="text-lg text-gray-700 font-semibold leading-tight">
                  {competitor.display_name}
                </p>
              )}

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {competitor.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 shadow-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {competitor.is_business_account && competitor.business_category && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">
                    <Building2 className="w-3 h-3 mr-1" />
                    {competitor.business_category}
                  </Badge>
                )}
                {competitor.is_private && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm">
                    <Lock className="w-3 h-3 mr-1" />
                    Cuenta Privada
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(competitor.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 rounded-full"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Bio Section */}
        {competitor.bio && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-xl border border-gray-100/50">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {competitor.bio}
            </p>
          </div>
        )}

        {/* Enhanced Stats Grid with Professional Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {formatNumber(competitor.follower_count)}
            </div>
            <div className="text-xs text-blue-700 font-medium">Seguidores</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-green-900">
              {competitor.competitor_videos?.length || 0}
            </div>
            <div className="text-xs text-green-700 font-medium">Videos</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-purple-900">
              {videosWithAnalysis}
            </div>
            <div className="text-xs text-purple-700 font-medium">Analizados</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-center mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-orange-900">
              {formatNumber(competitor.posts_count)}
            </div>
            <div className="text-xs text-orange-700 font-medium">Posts</div>
          </div>
        </div>

        {/* Additional Professional Stats */}
        {(competitor.highlight_reel_count > 0 || competitor.igtvvideocount > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {competitor.highlight_reel_count > 0 && (
              <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg border border-yellow-100/50">
                <div className="text-lg font-bold text-yellow-900">
                  {competitor.highlight_reel_count}
                </div>
                <div className="text-xs text-yellow-700 font-medium">Highlights</div>
              </div>
            )}
            {competitor.igtvvideocount > 0 && (
              <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-lg border border-pink-100/50">
                <div className="text-lg font-bold text-pink-900">
                  {competitor.igtvvideocount}
                </div>
                <div className="text-xs text-pink-700 font-medium">IGTV</div>
              </div>
            )}
          </div>
        )}

        {/* External URLs with Professional Design */}
        {externalUrls.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Enlaces externos
            </p>
            <div className="flex flex-wrap gap-2">
              {externalUrls.slice(0, 2).map((url, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                  className="text-xs px-3 py-2 h-auto bg-white/80 hover:bg-blue-50 border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {new URL(url).hostname}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {competitor.last_scraped_at && (
          <div className="text-center py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(competitor.last_scraped_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Action Buttons with Professional Design */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={() => onViewVideos(competitor)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Play className="h-4 w-4 mr-2" />
            Ver Videos
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`https://instagram.com/${competitor.instagram_username}`, '_blank')}
            className="px-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorCard;

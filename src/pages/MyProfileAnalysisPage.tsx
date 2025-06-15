
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  User, 
  Target, 
  BarChart3, 
  Sparkles, 
  Play, 
  Users, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMyProfileScraping } from '@/hooks/use-my-profile-scraping';

const MyProfileAnalysisPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [analysisType, setAnalysisType] = useState<'basic' | 'extensive' | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'completed'>('idle');
  const { user } = useAuth();
  const { toast } = useToast();
  const { scrapeProfile, isLoading, profiles, fetchProfiles } = useMyProfileScraping();

  const currentProfile = profiles.length > 0 ? profiles[0] : null;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleExtractProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setAnalysisStatus('extracting');
    
    const result = await scrapeProfile(username.trim());
    if (result) {
      setAnalysisStatus('idle');
      await fetchProfiles();
    } else {
      setAnalysisStatus('idle');
    }
  };

  const handleStartAnalysis = (type: 'basic' | 'extensive') => {
    setAnalysisType(type);
    setAnalysisStatus('analyzing');
    
    // Aquí iría la lógica para iniciar el análisis
    setTimeout(() => {
      setAnalysisStatus('completed');
      toast({
        title: `Análisis ${type === 'basic' ? 'básico' : 'extensivo'} completado`,
        description: "Los resultados están listos para revisar",
      });
    }, 5000);
  };

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

  const getStatusBadge = () => {
    switch (analysisStatus) {
      case 'extracting':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Extrayendo datos</Badge>;
      case 'analyzing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Analizando</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      default:
        return null;
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-flow-blue mb-2">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Análisis de Mi Perfil</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analiza tu perfil de Instagram
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Obtén insights profundos sobre tu estrategia de contenido y descubre oportunidades de mejora
          </p>
          {getStatusBadge() && (
            <div className="mt-4">
              {getStatusBadge()}
            </div>
          )}
        </div>

        {/* Formulario de extracción o datos del perfil */}
        {!currentProfile ? (
          <Card className="mb-8 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-flow-blue" />
                Conectar tu perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExtractProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tu username de Instagram</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ej: tu_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Introduce tu username sin el símbolo @
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !username.trim()}
                  className="w-full bg-flow-blue hover:bg-flow-blue/90"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Extrayendo perfil...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Extraer datos del perfil
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Profile Card - Similar to CompetitorCard */}
            <Card className="border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300 max-w-2xl mx-auto">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                        <AspectRatio ratio={1}>
                          {currentProfile.profile_picture_url ? (
                            <img
                              src={getImageUrl(currentProfile.profile_picture_url)}
                              alt={currentProfile.display_name || currentProfile.instagram_username}
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
                            className="fallback-avatar absolute inset-0 w-full h-full flex items-center justify-center bg-flow-blue text-white font-medium text-lg"
                            style={{ display: currentProfile.profile_picture_url ? 'none' : 'flex' }}
                          >
                            {currentProfile.instagram_username.substring(0, 2).toUpperCase()}
                          </div>
                        </AspectRatio>
                      </div>
                      
                      {currentProfile.is_verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          @{currentProfile.instagram_username}
                        </h3>
                        {currentProfile.is_verified && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      
                      {currentProfile.display_name && (
                        <p className="text-sm text-gray-600 font-medium">
                          {currentProfile.display_name}
                        </p>
                      )}

                      {currentProfile.is_business_account && currentProfile.business_category && (
                        <Badge variant="outline" className="text-xs mt-1 bg-gray-50 text-gray-600 border-gray-200">
                          <Building2 className="h-3 w-3 mr-1" />
                          {currentProfile.business_category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Change Profile Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cambiar perfil
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Bio Section */}
                {currentProfile.bio && (
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {currentProfile.bio}
                    </p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatNumber(currentProfile.follower_count)}
                    </div>
                    <div className="text-xs text-gray-600">Seguidores</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      {currentProfile.my_profile_videos?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Videos</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatNumber(currentProfile.following_count)}
                    </div>
                    <div className="text-xs text-gray-600">Siguiendo</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatNumber(currentProfile.posts_count)}
                    </div>
                    <div className="text-xs text-gray-600">Posts</div>
                  </div>
                </div>

                {/* External URLs */}
                {currentProfile.external_urls && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Enlaces externos</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(currentProfile.external_urls).slice(0, 2).map((url: string, index: number) => {
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
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Última actualización: {formatDate(currentProfile.last_scraped_at)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://instagram.com/${currentProfile.instagram_username}`, '_blank')}
                    className="px-4 bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Instagram
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opciones de análisis */}
            {analysisStatus === 'idle' && (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Análisis Básico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Análisis rápido de tu perfil basado en métricas generales y optimización básica.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-2 mb-6">
                      <li>• Análisis de métricas del perfil</li>
                      <li>• Optimización de bio y hashtags</li>
                      <li>• Recomendaciones básicas</li>
                      <li>• Tiempo estimado: 2-3 minutos</li>
                    </ul>
                    <Button 
                      onClick={() => handleStartAnalysis('basic')}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Iniciar análisis básico
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer group border-flow-blue/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-flow-blue" />
                      Análisis Extensivo
                      <Badge className="bg-flow-blue/10 text-flow-blue text-xs">Recomendado</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Análisis profundo con IA que incluye estudio detallado de videos y alineación estratégica.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-2 mb-6">
                      <li>• Análisis detallado de todos los videos</li>
                      <li>• Alineación con propuesta de valor</li>
                      <li>• Estrategias de mejora personalizadas</li>
                      <li>• Comparativa con competencia</li>
                      <li>• Tiempo estimado: 8-10 minutos</li>
                    </ul>
                    <Button 
                      onClick={() => handleStartAnalysis('extensive')}
                      className="w-full bg-flow-blue hover:bg-flow-blue/90"
                    >
                      Iniciar análisis extensivo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Estado de análisis */}
            {analysisStatus === 'analyzing' && (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-flow-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flow-blue"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Análisis {analysisType === 'basic' ? 'básico' : 'extensivo'} en progreso
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Nuestra IA está analizando tu perfil y contenido. Esto puede tomar unos minutos.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Tiempo estimado: {analysisType === 'basic' ? '2-3' : '8-10'} minutos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resultados del análisis */}
            {analysisStatus === 'completed' && (
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Análisis completado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Tu análisis {analysisType === 'basic' ? 'básico' : 'extensivo'} está listo
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Hemos completado el análisis de tu perfil. Los resultados incluyen recomendaciones personalizadas.
                    </p>
                    <Button className="bg-flow-blue hover:bg-flow-blue/90">
                      Ver resultados del análisis
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfileAnalysisPage;

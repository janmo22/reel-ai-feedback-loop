
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MyProfileAnalysisPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [analysisType, setAnalysisType] = useState<'basic' | 'extensive' | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'completed'>('idle');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleExtractProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setAnalysisStatus('extracting');
    
    try {
      // Aquí iría la lógica para extraer el perfil usando Apify
      // Simulamos la extracción por ahora
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock data - esto será reemplazado por datos reales
      const mockProfile = {
        username: username.trim(),
        display_name: "Usuario Ejemplo",
        follower_count: 15420,
        following_count: 892,
        posts_count: 156,
        bio: "Creador de contenido digital | Marketing & Growth",
        is_verified: false,
        videos_count: 42
      };
      
      setProfileData(mockProfile);
      setAnalysisStatus('idle');
      
      toast({
        title: "¡Perfil extraído exitosamente!",
        description: `Se han extraído los datos de @${username}`,
      });
      
    } catch (error) {
      console.error('Error extracting profile:', error);
      setAnalysisStatus('idle');
      toast({
        title: "Error al extraer perfil",
        description: "No se pudo extraer la información del perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
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

        {/* Formulario de extracción */}
        {!profileData && (
          <Card className="mb-8">
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
        )}

        {/* Datos del perfil extraído */}
        {profileData && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-flow-blue" />
                    Perfil conectado
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setProfileData(null);
                      setUsername('');
                      setAnalysisStatus('idle');
                    }}
                  >
                    Cambiar perfil
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-flow-blue/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-flow-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">@{profileData.username}</h3>
                    <p className="text-gray-600">{profileData.display_name}</p>
                    {profileData.bio && (
                      <p className="text-sm text-gray-500 mt-1">{profileData.bio}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.follower_count)}</div>
                    <div className="text-sm text-gray-600">Seguidores</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(profileData.following_count)}</div>
                    <div className="text-sm text-gray-600">Siguiendo</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{profileData.posts_count}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{profileData.videos_count}</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opciones de análisis */}
            {analysisStatus === 'idle' && (
              <div className="grid md:grid-cols-2 gap-6">
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
              <Card>
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
              <Card>
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


import React, { useEffect, useState } from 'react';
import { useCompetitorScraping, CompetitorData } from '@/hooks/use-competitor-scraping';
import AddCompetitorForm from '@/components/competitors/AddCompetitorForm';
import CompetitorCard from '@/components/competitors/CompetitorCard';
import CompetitorVideoGrid from '@/components/competitors/CompetitorVideoGrid';
import { Target, TrendingUp, Users2, Info, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CompetitorsPage: React.FC = () => {
  const { competitors, fetchCompetitors, deleteCompetitor } = useCompetitorScraping();
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorData | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const handleCompetitorAdded = () => {
    fetchCompetitors();
  };

  const handleViewVideos = (competitor: CompetitorData) => {
    setSelectedCompetitor(competitor);
  };

  const handleBackToList = () => {
    setSelectedCompetitor(null);
    fetchCompetitors();
  };

  if (selectedCompetitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <CompetitorVideoGrid 
            competitor={selectedCompetitor} 
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalVideos = competitors.reduce((sum, comp) => sum + (comp.competitor_videos?.length || 0), 0);
  const totalAnalyzed = competitors.reduce((sum, comp) => 
    sum + comp.competitor_videos?.reduce((videoSum, video) => 
      videoSum + (video.competitor_analysis?.length || 0), 0
    ), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Target className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Análisis de Competencia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre estrategias ganadoras analizando el contenido de tus competidores en Instagram
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Competidores</p>
                  <p className="text-3xl font-bold text-gray-900">{competitors.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVideos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Análisis Realizados</p>
                  <p className="text-3xl font-bold text-gray-900">{totalAnalyzed}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Add Competitor Form */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Agregar Competidor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddCompetitorForm onCompetitorAdded={handleCompetitorAdded} />
              </CardContent>
            </Card>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* How it Works */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Info className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-4">¿Cómo funciona?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                          <p className="text-gray-700">Agrega el username de Instagram</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                          <p className="text-gray-700">Extracción automática de reels</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                          <p className="text-gray-700">Selecciona videos para analizar</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                          <p className="text-gray-700">Obtén insights con IA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competitors Grid */}
            {competitors.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Users2 className="h-6 w-6 text-blue-600" />
                  Tus Competidores ({competitors.length})
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {competitors.map((competitor) => (
                    <CompetitorCard
                      key={competitor.id}
                      competitor={competitor}
                      onDelete={deleteCompetitor}
                      onViewVideos={handleViewVideos}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users2 className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes competidores</h3>
                  <p className="text-gray-600 mb-6">
                    Agrega tu primer competidor para comenzar a analizar su estrategia de contenido
                  </p>
                  <div className="w-full max-w-md mx-auto">
                    <p className="text-sm text-gray-500">
                      💡 Tip: Busca cuentas similares a la tuya en tu nicho para obtener mejores insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorsPage;

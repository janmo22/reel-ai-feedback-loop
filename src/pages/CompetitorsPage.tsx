
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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header minimalista */}
        <div className="mb-12">
          <div className="border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">
              Análisis de Competencia
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Descubre estrategias ganadoras analizando el contenido de tus competidores
            </p>
          </div>
        </div>

        {/* Stats minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{competitors.length}</div>
            <div className="text-sm text-gray-600">Competidores</div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{totalVideos}</div>
            <div className="text-sm text-gray-600">Videos Totales</div>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">{totalAnalyzed}</div>
            <div className="text-sm text-gray-600">Análisis Realizados</div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Formulario simplificado */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Agregar Competidor
              </h3>
              <AddCompetitorForm onCompetitorAdded={handleCompetitorAdded} />
            </div>
          </div>
          
          {/* Área de contenido */}
          <div className="lg:col-span-3">
            {/* Instrucciones simplificadas */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4">¿Cómo funciona?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <span>Agrega el username de Instagram</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <span>Extracción automática de reels</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <span>Selecciona videos para analizar</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-medium">4</div>
                    <span>Obtén insights con IA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de competidores */}
            {competitors.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-gray-900">
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
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes competidores</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Agrega tu primer competidor para comenzar a analizar su estrategia de contenido
                </p>
                <p className="text-sm text-gray-500">
                  💡 Tip: Busca cuentas similares a la tuya en tu nicho para obtener mejores insights
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorsPage;

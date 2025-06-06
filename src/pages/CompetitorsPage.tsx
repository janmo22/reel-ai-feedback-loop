
import React, { useEffect, useState } from 'react';
import { useCompetitorScraping, CompetitorData } from '@/hooks/use-competitor-scraping';
import AddCompetitorForm from '@/components/competitors/AddCompetitorForm';
import CompetitorCard from '@/components/competitors/CompetitorCard';
import CompetitorVideoGrid from '@/components/competitors/CompetitorVideoGrid';
import { Users, Target } from 'lucide-react';

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
    fetchCompetitors(); // Refresh data when going back
  };

  if (selectedCompetitor) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <CompetitorVideoGrid 
          competitor={selectedCompetitor} 
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-8 w-8 text-flow-electric" />
          <h1 className="text-3xl font-bold">Análisis de Competencia</h1>
        </div>
        <p className="text-muted-foreground">
          Analiza el contenido de tus competidores en Instagram para mejorar tu estrategia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <AddCompetitorForm onCompetitorAdded={handleCompetitorAdded} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">¿Cómo funciona?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Agrega el username de Instagram de tu competidor</li>
              <li>• Extraemos automáticamente sus últimos reels y datos del perfil</li>
              <li>• Selecciona los videos que quieres analizar con IA</li>
              <li>• Obtén insights sobre su estrategia de contenido</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Competidores ({competitors.length})
        </h2>
      </div>

      {competitors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onDelete={deleteCompetitor}
              onViewVideos={handleViewVideos}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay competidores</h3>
          <p className="text-gray-500">Agrega tu primer competidor para comenzar el análisis</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorsPage;

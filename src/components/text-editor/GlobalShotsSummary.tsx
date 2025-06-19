
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin } from 'lucide-react';
import { useAllVideoShots } from '@/hooks/use-section-shots';

interface GlobalShotsSummaryProps {
  videoContextId: string;
}

export const GlobalShotsSummary: React.FC<GlobalShotsSummaryProps> = ({ videoContextId }) => {
  const { allShots, getShotUsageBySection } = useAllVideoShots(videoContextId);
  
  if (allShots.length === 0) {
    return null;
  }

  const shotUsage = getShotUsageBySection();

  // Get section names mapping (you might want to pass this as props or get from context)
  const getSectionName = (sectionId: string) => {
    const sectionNames: { [key: string]: string } = {
      'hook': 'Hook',
      'build-up': 'Build-up',
      'value-add': 'Value Add',
      'call-to-action': 'Call to Action',
      'free-mode': 'Guión Libre'
    };
    return sectionNames[sectionId] || sectionId;
  };

  return (
    <Card className="border-flow-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-flow-blue">
          <Camera className="h-5 w-5" />
          Resumen Global de Tomas ({allShots.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Todas las tomas creadas en este video y las secciones donde aparecen.
        </p>
        
        <div className="space-y-3">
          {allShots.map((shot) => {
            const usedInSections = shotUsage[shot.id] || [];
            const totalSegments = shot.textSegments.length;
            
            return (
              <div key={shot.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: shot.color }}
                    />
                    <span className="font-medium text-gray-900">{shot.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {totalSegments} segmento{totalSegments !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                
                {usedInSections.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Aparece en:</span>
                    {usedInSections.map((sectionId) => (
                      <Badge
                        key={sectionId}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${shot.color}20`,
                          color: shot.color,
                          borderColor: `${shot.color}40`
                        }}
                      >
                        {getSectionName(sectionId)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Total: {allShots.length} {allShots.length === 1 ? 'toma' : 'tomas'} • {' '}
            {allShots.reduce((acc, shot) => acc + shot.textSegments.length, 0)} segmentos totales
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

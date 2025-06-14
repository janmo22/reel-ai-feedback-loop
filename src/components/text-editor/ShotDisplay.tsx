
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shot } from '@/hooks/use-advanced-editor';

interface ShotDisplayProps {
  shots: Shot[];
}

export const ShotDisplay: React.FC<ShotDisplayProps> = ({ shots }) => {
  if (shots.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Selecciona texto para crear tomas
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">
        Tomas creadas ({shots.length}):
      </div>
      {shots.map((shot) => (
        <Card key={shot.id} className="border-l-4" style={{ borderLeftColor: shot.color }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: shot.color }}
              />
              {shot.name}
              <Badge variant="secondary" className="text-xs">
                {shot.textSegments.length} {shot.textSegments.length === 1 ? 'segmento' : 'segmentos'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {shot.textSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="text-xs p-2 rounded border-l-2"
                  style={{ 
                    borderLeftColor: shot.color,
                    backgroundColor: `${shot.color}10`
                  }}
                >
                  "{segment.text}"
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

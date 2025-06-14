
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Shot } from '@/hooks/use-advanced-editor';

interface ShotDisplayProps {
  shots: Shot[];
  onToggleStrikethrough?: (segmentId: string) => void;
}

export const ShotDisplay: React.FC<ShotDisplayProps> = ({ shots, onToggleStrikethrough }) => {
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
                  className="flex items-center justify-between gap-2 text-xs p-2 rounded border-l-2"
                  style={{ 
                    borderLeftColor: shot.color,
                    backgroundColor: `${shot.color}10`
                  }}
                >
                  <div 
                    className={`flex-1 ${segment.isStrikethrough ? 'line-through opacity-60' : ''}`}
                  >
                    "{segment.text}"
                  </div>
                  {onToggleStrikethrough && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleStrikethrough(segment.id)}
                      className={`h-6 w-6 p-0 ${
                        segment.isStrikethrough 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={segment.isStrikethrough ? 'Marcar como no grabado' : 'Marcar como grabado'}
                    >
                      {segment.isStrikethrough ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

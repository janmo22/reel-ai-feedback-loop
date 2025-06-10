
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Palette } from 'lucide-react';
import { Shot } from '@/hooks/use-text-editor';

interface ShotManagerProps {
  shots: Shot[];
  onAddShot: (name: string, color: string) => Shot;
}

const ShotManager: React.FC<ShotManagerProps> = ({ shots }) => {
  if (shots.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Camera className="h-5 w-5 text-gray-600" />
          Tomas Creadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => (
            <div
              key={shot.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: shot.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {shot.name}
                </div>
                {shot.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {shot.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShotManager;

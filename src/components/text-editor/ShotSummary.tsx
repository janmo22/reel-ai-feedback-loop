
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shot } from '@/hooks/use-advanced-editor';
import { BarChart3 } from 'lucide-react';

interface ShotSummaryProps {
  shots: Shot[];
}

export const ShotSummary: React.FC<ShotSummaryProps> = ({ shots }) => {
  if (shots.length === 0) {
    return null;
  }

  // Group shots by color/name for summary
  const shotGroups = shots.reduce((acc, shot) => {
    const key = `${shot.name}-${shot.color}`;
    if (!acc[key]) {
      acc[key] = {
        name: shot.name,
        color: shot.color,
        totalSegments: 0,
        shots: []
      };
    }
    acc[key].totalSegments += shot.textSegments.length;
    acc[key].shots.push(shot);
    return acc;
  }, {} as Record<string, { name: string; color: string; totalSegments: number; shots: Shot[] }>);

  return (
    <Card className="border-0 shadow-sm bg-gray-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
          <BarChart3 className="h-4 w-4" />
          Resumen de Tomas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {Object.values(shotGroups).map((group, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2 py-1"
              style={{
                borderColor: group.color,
                backgroundColor: `${group.color}10`,
                color: group.color
              }}
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: group.color }}
              />
              {group.name} ({group.totalSegments})
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total: {shots.length} {shots.length === 1 ? 'toma' : 'tomas'} • {shots.reduce((acc, shot) => acc + shot.textSegments.length, 0)} segmentos
        </p>
      </CardContent>
    </Card>
  );
};

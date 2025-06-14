
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoTooltipProps {
  segmentId: string;
  x: number;
  y: number;
  shotName?: string;
  additionalInfo?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  segmentId,
  x,
  y,
  shotName,
  additionalInfo
}) => {
  if (!additionalInfo || additionalInfo.trim() === '') {
    return null;
  }

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: x,
        top: y - 10,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      <Card className="border shadow-lg bg-white max-w-xs">
        <CardContent className="p-3">
          {shotName && (
            <div className="text-xs font-medium text-gray-900 mb-1">
              {shotName}
            </div>
          )}
          <div className="text-xs text-gray-600 whitespace-pre-wrap">
            {additionalInfo}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoTooltipProps {
  segmentId: string;
  x: number;
  y: number;
  shotName?: string;
  comments?: string[];
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  segmentId,
  x,
  y,
  shotName,
  comments
}) => {
  if (!comments || comments.length === 0) {
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
            <div className="text-xs font-medium text-gray-900 mb-2">
              {shotName}
            </div>
          )}
          <div className="space-y-1">
            {comments.map((comment, index) => (
              <div 
                key={index} 
                className="text-xs text-gray-600 p-2 bg-blue-50 rounded border-l-2 border-blue-200"
              >
                {comment}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

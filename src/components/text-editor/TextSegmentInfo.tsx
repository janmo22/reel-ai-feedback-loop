
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Info, Edit3, Save, X } from 'lucide-react';
import { TextSegment, Shot } from '@/hooks/use-text-editor';

interface TextSegmentInfoProps {
  segments: TextSegment[];
  shots: Shot[];
  onUpdateInfo: (segmentId: string, information: string) => void;
}

const TextSegmentInfo: React.FC<TextSegmentInfoProps> = ({
  segments,
  shots,
  onUpdateInfo
}) => {
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (segment: TextSegment) => {
    setEditingSegment(segment.id);
    setEditText(segment.information || '');
  };

  const handleSaveEdit = () => {
    if (editingSegment) {
      onUpdateInfo(editingSegment, editText);
      setEditingSegment(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSegment(null);
    setEditText('');
  };

  const getShotForSegment = (shotId?: string) => {
    return shots.find(shot => shot.id === shotId);
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Info className="h-5 w-5 text-gray-600" />
          Información de Tomas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {segments.map((segment) => {
            const shot = getShotForSegment(segment.shotId);
            const isEditing = editingSegment === segment.id;

            return (
              <div
                key={segment.id}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/30"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {shot && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shot.color }}
                        />
                      )}
                      <span className="font-medium text-sm text-gray-900">
                        {shot?.name || 'Toma sin nombre'}
                      </span>
                    </div>
                    <div 
                      className="text-sm px-2 py-1 rounded bg-white border border-gray-200 inline-block"
                      style={{ color: shot?.color || '#666' }}
                    >
                      "{segment.text}"
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(segment)}
                      className="h-8 px-2"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Agrega información adicional sobre esta toma..."
                      className="min-h-[80px] text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-8 text-xs bg-gray-900 hover:bg-gray-800"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  segment.information && (
                    <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100 mt-3">
                      {segment.information}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TextSegmentInfo;

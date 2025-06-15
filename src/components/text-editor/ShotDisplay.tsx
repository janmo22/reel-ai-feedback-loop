
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare, Film } from 'lucide-react';
import { Shot } from '@/hooks/use-advanced-editor';

interface ShotDisplayProps {
  shots: Shot[];
  onToggleStrikethrough?: (segmentId: string) => void;
  onAddSegmentInfo?: (segmentId: string, info: string) => void;
  onUpdateSegmentInfo?: (segmentId: string, info: string) => void;
  onRemoveSegmentInfo?: (segmentId: string) => void;
}

export const ShotDisplay: React.FC<ShotDisplayProps> = ({ 
  shots, 
  onToggleStrikethrough,
  onAddSegmentInfo,
  onUpdateSegmentInfo,
  onRemoveSegmentInfo
}) => {
  const [expandedShots, setExpandedShots] = useState<Set<string>>(new Set());
  const [shotsVisible, setShotsVisible] = useState(true);
  const [editingSegmentInfo, setEditingSegmentInfo] = useState<{ segmentId: string; isEditing: boolean }>({ segmentId: '', isEditing: false });
  const [segmentInfoText, setSegmentInfoText] = useState('');

  const toggleShotExpanded = (shotId: string) => {
    setExpandedShots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shotId)) {
        newSet.delete(shotId);
      } else {
        newSet.add(shotId);
      }
      return newSet;
    });
  };

  const handleAddSegmentInfo = (segmentId: string) => {
    if (segmentInfoText.trim() && onAddSegmentInfo) {
      onAddSegmentInfo(segmentId, segmentInfoText.trim());
      setSegmentInfoText('');
      setEditingSegmentInfo({ segmentId: '', isEditing: false });
    }
  };

  const handleUpdateSegmentInfo = (segmentId: string) => {
    if (segmentInfoText.trim() && onUpdateSegmentInfo) {
      onUpdateSegmentInfo(segmentId, segmentInfoText.trim());
      setSegmentInfoText('');
      setEditingSegmentInfo({ segmentId: '', isEditing: false });
    }
  };

  const startEditingSegmentInfo = (segmentId: string, currentInfo?: string) => {
    setSegmentInfoText(currentInfo || '');
    setEditingSegmentInfo({ segmentId, isEditing: true });
  };

  if (shots.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Film className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Selecciona texto para crear tomas</p>
        <p className="text-xs mt-1">Organiza tu guión por escenas y planos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-800">
            Tomas del Guión
          </h3>
          <Badge variant="secondary" className="text-xs">
            {shots.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShotsVisible(!shotsVisible)}
          className="text-xs h-7"
        >
          {shotsVisible ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Ocultar
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Mostrar
            </>
          )}
        </Button>
      </div>

      {/* Shots list */}
      {shotsVisible && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shots.map((shot) => (
            <Card 
              key={shot.id} 
              className="border-l-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeftColor: shot.color }}
            >
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: shot.color }}
                    />
                    <span className="font-medium">{shot.name}</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {shot.textSegments.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShotExpanded(shot.id)}
                    className="h-6 w-6 p-0"
                  >
                    {expandedShots.has(shot.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3">
                {/* Preview text (always visible) */}
                <div className="mb-2">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {shot.textSegments.map(s => s.text).join(' ').slice(0, 120)}...
                  </p>
                </div>

                {/* Expanded content */}
                {expandedShots.has(shot.id) && (
                  <div className="space-y-2 border-t pt-2">
                    {/* Text segments */}
                    {shot.textSegments.map((segment) => (
                      <div key={segment.id} className="space-y-1">
                        <div
                          className="flex items-start justify-between gap-2 text-xs p-2 rounded bg-gray-50 border-l-2"
                          style={{ borderLeftColor: shot.color }}
                        >
                          <div 
                            className={`flex-1 ${segment.isStrikethrough ? 'line-through opacity-60' : ''}`}
                          >
                            "{segment.text}"
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingSegmentInfo(segment.id, segment.additionalInfo)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                              title="Añadir información adicional"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            {onToggleStrikethrough && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleStrikethrough(segment.id)}
                                className={`h-5 w-5 p-0 ${
                                  segment.isStrikethrough 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                                title={segment.isStrikethrough ? 'Restaurar' : 'Marcar como usado'}
                              >
                                {segment.isStrikethrough ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Segment additional info display */}
                        {segment.additionalInfo && !editingSegmentInfo.isEditing && (
                          <div className="ml-2 p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-200">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <span className="font-medium text-blue-800">Información Adicional:</span>
                                <p className="text-blue-700 mt-1">{segment.additionalInfo}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingSegmentInfo(segment.id, segment.additionalInfo)}
                                className="h-5 w-5 p-0 text-blue-400 hover:text-blue-600"
                                title="Editar información"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Segment additional info form */}
                        {editingSegmentInfo.segmentId === segment.id && editingSegmentInfo.isEditing && (
                          <div className="ml-2 p-2 bg-blue-50 rounded text-xs border">
                            <Textarea
                              placeholder="Información adicional (estilo, emoción, instrucciones...)"
                              value={segmentInfoText}
                              onChange={(e) => setSegmentInfoText(e.target.value)}
                              rows={2}
                              className="text-xs mb-2"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (segment.additionalInfo) {
                                    handleUpdateSegmentInfo(segment.id);
                                  } else {
                                    handleAddSegmentInfo(segment.id);
                                  }
                                }}
                                className="h-6 text-xs px-2"
                              >
                                {segment.additionalInfo ? 'Actualizar' : 'Añadir'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSegmentInfo({ segmentId: '', isEditing: false })}
                                className="h-6 text-xs px-2"
                              >
                                Cancelar
                              </Button>
                              {segment.additionalInfo && onRemoveSegmentInfo && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    onRemoveSegmentInfo(segment.id);
                                    setEditingSegmentInfo({ segmentId: '', isEditing: false });
                                  }}
                                  className="h-6 text-xs px-2 text-red-500 hover:text-red-700"
                                >
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

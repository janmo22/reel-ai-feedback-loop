import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Plus, Edit, Trash2, Info } from 'lucide-react';
import { Shot, ShotInfo } from '@/hooks/use-advanced-editor';

interface ShotDisplayProps {
  shots: Shot[];
  onToggleStrikethrough?: (segmentId: string) => void;
  onAddShotInfo?: (shotId: string, label: string, value: string) => void;
  onUpdateShotInfo?: (shotId: string, infoId: string, label: string, value: string) => void;
  onRemoveShotInfo?: (shotId: string, infoId: string) => void;
}

export const ShotDisplay: React.FC<ShotDisplayProps> = ({ 
  shots, 
  onToggleStrikethrough,
  onAddShotInfo,
  onUpdateShotInfo,
  onRemoveShotInfo 
}) => {
  const [expandedShots, setExpandedShots] = useState<Set<string>>(new Set());
  const [editingInfo, setEditingInfo] = useState<{ shotId: string; infoId: string | null }>({ shotId: '', infoId: null });
  const [newInfoLabel, setNewInfoLabel] = useState('');
  const [newInfoValue, setNewInfoValue] = useState('');

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

  const handleAddInfo = (shotId: string) => {
    if (newInfoLabel.trim() && newInfoValue.trim() && onAddShotInfo) {
      onAddShotInfo(shotId, newInfoLabel.trim(), newInfoValue.trim());
      setNewInfoLabel('');
      setNewInfoValue('');
      setEditingInfo({ shotId: '', infoId: null });
    }
  };

  const handleUpdateInfo = (shotId: string, infoId: string) => {
    if (newInfoLabel.trim() && newInfoValue.trim() && onUpdateShotInfo) {
      onUpdateShotInfo(shotId, infoId, newInfoLabel.trim(), newInfoValue.trim());
      setNewInfoLabel('');
      setNewInfoValue('');
      setEditingInfo({ shotId: '', infoId: null });
    }
  };

  const startEditingInfo = (shotId: string, info?: ShotInfo) => {
    if (info) {
      setNewInfoLabel(info.label);
      setNewInfoValue(info.value);
      setEditingInfo({ shotId, infoId: info.id });
    } else {
      setNewInfoLabel('');
      setNewInfoValue('');
      setEditingInfo({ shotId, infoId: null });
    }
  };

  const cancelEditing = () => {
    setEditingInfo({ shotId: '', infoId: null });
    setNewInfoLabel('');
    setNewInfoValue('');
  };

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
              {shot.additionalInfo.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  {shot.additionalInfo.length} info
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleShotExpanded(shot.id)}
                className="ml-auto h-6 w-6 p-0"
              >
                {expandedShots.has(shot.id) ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {/* Text segments */}
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

              {/* Additional info section */}
              {expandedShots.has(shot.id) && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Información adicional:</span>
                    {editingInfo.shotId !== shot.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingInfo(shot.id)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir
                      </Button>
                    )}
                  </div>

                  {/* Existing info items */}
                  {shot.additionalInfo.map((info) => (
                    <div key={info.id} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{info.label}:</span> {info.value}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingInfo(shot.id, info)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveShotInfo?.(shot.id, info.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Add/Edit form */}
                  {editingInfo.shotId === shot.id && (
                    <div className="space-y-2 p-3 bg-gray-50 rounded border">
                      <Input
                        placeholder="Etiqueta (ej: Estilo, Emoción, Instrucción)"
                        value={newInfoLabel}
                        onChange={(e) => setNewInfoLabel(e.target.value)}
                        className="text-xs"
                      />
                      <Input
                        placeholder="Valor (ej: Sonriendo, Triste, Primer plano)"
                        value={newInfoValue}
                        onChange={(e) => setNewInfoValue(e.target.value)}
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (editingInfo.infoId) {
                              handleUpdateInfo(shot.id, editingInfo.infoId);
                            } else {
                              handleAddInfo(shot.id);
                            }
                          }}
                          disabled={!newInfoLabel.trim() || !newInfoValue.trim()}
                          className="h-6 text-xs"
                        >
                          {editingInfo.infoId ? 'Actualizar' : 'Añadir'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          className="h-6 text-xs"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {shot.additionalInfo.length === 0 && editingInfo.shotId !== shot.id && (
                    <p className="text-xs text-gray-500 italic">
                      No hay información adicional. Haz clic en "Añadir" para agregar detalles como estilo, emoción, instrucciones, etc.
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

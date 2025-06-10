
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Edit3, Save, X, Camera, Check, Filter } from 'lucide-react';
import { TextSegment, Shot } from '@/hooks/use-text-editor';

interface TextSegmentInfoProps {
  segments: TextSegment[];
  shots: Shot[];
  onUpdateInfo: (segmentId: string, information: string) => void;
  onToggleRecorded: (shotId: string) => void;
}

const TextSegmentInfo: React.FC<TextSegmentInfoProps> = ({
  segments,
  shots,
  onUpdateInfo,
  onToggleRecorded
}) => {
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'recorded' | 'pending'>('all');
  const [filterByShot, setFilterByShot] = useState<string>('all');

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

  // Group segments by shot
  const segmentsByShot = segments.reduce((acc, segment) => {
    const shot = getShotForSegment(segment.shotId);
    const shotName = shot?.name || 'Sin toma';
    
    if (!acc[shotName]) {
      acc[shotName] = { shot, segments: [] };
    }
    acc[shotName].segments.push(segment);
    return acc;
  }, {} as Record<string, { shot?: Shot; segments: TextSegment[] }>);

  // Apply filters
  const filteredShotGroups = Object.entries(segmentsByShot).filter(([shotName, group]) => {
    // Filter by recording status
    if (filterBy === 'recorded' && !group.shot?.recorded) return false;
    if (filterBy === 'pending' && group.shot?.recorded) return false;
    
    // Filter by specific shot
    if (filterByShot !== 'all' && group.shot?.id !== filterByShot) return false;
    
    return true;
  });

  const uniqueShots = Array.from(new Set(shots.map(shot => shot.id)))
    .map(id => shots.find(shot => shot.id === id))
    .filter(Boolean) as Shot[];

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Info className="h-5 w-5 text-gray-600" />
            Gestión de Tomas
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterBy} onValueChange={(value: 'all' | 'recorded' | 'pending') => setFilterBy(value)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="recorded">Grabadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterByShot} onValueChange={setFilterByShot}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Filtrar por toma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tomas</SelectItem>
                {uniqueShots.map((shot) => (
                  <SelectItem key={shot.id} value={shot.id}>
                    {shot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {filteredShotGroups.map(([shotName, group]) => (
            <div key={shotName} className="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
              {/* Shot header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {group.shot && (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: group.shot.color }}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{shotName}</h3>
                    <p className="text-sm text-gray-500">
                      {group.segments.length} {group.segments.length === 1 ? 'segmento' : 'segmentos'}
                    </p>
                  </div>
                </div>
                
                {group.shot && (
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={group.shot.recorded ? "default" : "outline"}
                      className={group.shot.recorded ? "bg-green-600" : ""}
                    >
                      {group.shot.recorded ? 'Grabada' : 'Pendiente'}
                    </Badge>
                    <Button
                      variant={group.shot.recorded ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleRecorded(group.shot!.id)}
                      className={`h-8 w-8 p-0 ${
                        group.shot.recorded 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {group.shot.recorded ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Segments */}
              <div className="space-y-3">
                {group.segments.map((segment) => {
                  const isEditing = editingSegment === segment.id;

                  return (
                    <div key={segment.id} className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div 
                            className="text-sm px-2 py-1 rounded bg-gray-50 border border-gray-200 inline-block font-medium"
                            style={{ borderLeftColor: group.shot?.color, borderLeftWidth: '3px' }}
                          >
                            "{segment.text}"
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Botón para marcar como grabado individual */}
                          {group.shot && (
                            <Button
                              variant={group.shot.recorded ? "default" : "outline"}
                              size="sm"
                              onClick={() => onToggleRecorded(group.shot!.id)}
                              className={`h-6 w-6 p-0 ${
                                group.shot.recorded 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {group.shot.recorded ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Camera className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                          
                          {!isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(segment)}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Agrega información adicional sobre esta toma..."
                            className="min-h-[60px] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-7 text-xs bg-gray-900 hover:bg-gray-800"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Guardar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-7 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        segment.information && (
                          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100 mt-2">
                            <strong>Información:</strong> {segment.information}
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredShotGroups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <div className="text-sm">No hay tomas que coincidan con los filtros</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TextSegmentInfo;


import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, X, Check, Eye, EyeOff, Camera } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScriptSection as ScriptSectionType, SECTION_TYPES, TextSegment } from '@/hooks/use-text-editor';

interface ScriptSectionProps {
  section: ScriptSectionType;
  onContentChange: (content: string) => void;
  onTextSelection: () => void;
  onApplyStyling: () => void;
  onToggleCollapse: () => void;
  onAddSegmentInfo: (segmentId: string, info: string) => void;
  onRemoveSegment: (segmentId: string) => void;
  onToggleShotRecorded: (shotId: string) => void;
  shots: any[];
  editorRef: React.RefObject<HTMLDivElement>;
}

const ScriptSection: React.FC<ScriptSectionProps> = ({
  section,
  onContentChange,
  onTextSelection,
  onApplyStyling,
  onToggleCollapse,
  onAddSegmentInfo,
  onRemoveSegment,
  onToggleShotRecorded,
  shots,
  editorRef
}) => {
  const sectionConfig = SECTION_TYPES[section.type];
  const [editingInfo, setEditingInfo] = useState<string | null>(null);
  const [infoText, setInfoText] = useState('');
  const [showRecordedInText, setShowRecordedInText] = useState(true);
  const [highlightStyles, setHighlightStyles] = useState<React.CSSProperties>({});

  const getShotColor = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.color || '#3B82F6';
  };

  const getShotName = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.name || 'Sin toma';
  };

  const isShotRecorded = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.recorded || false;
  };

  // Crear estilos de subrayado dinámicos para cada segmento
  const createHighlightStyles = useCallback(() => {
    if (!section.content || section.segments.length === 0) {
      setHighlightStyles({});
      return;
    }

    const styles: React.CSSProperties = {};
    
    // Crear un gradiente linear para cada segmento
    const gradientStops: string[] = [];
    let lastPosition = 0;
    
    // Ordenar segmentos por posición
    const sortedSegments = [...section.segments].sort((a, b) => a.startIndex - b.startIndex);
    
    sortedSegments.forEach(segment => {
      const startPercent = (segment.startIndex / section.content.length) * 100;
      const endPercent = (segment.endIndex / section.content.length) * 100;
      const shotColor = getShotColor(segment.shotId);
      const isRecorded = isShotRecorded(segment.shotId);
      
      // Área transparente antes del segmento
      if (startPercent > lastPosition) {
        gradientStops.push(`transparent ${lastPosition}%`);
        gradientStops.push(`transparent ${startPercent}%`);
      }
      
      // Área del segmento con color
      const backgroundColor = `${shotColor}20`; // 20% opacity
      const borderColor = shotColor;
      
      gradientStops.push(`${backgroundColor} ${startPercent}%`);
      gradientStops.push(`${backgroundColor} ${endPercent}%`);
      
      lastPosition = endPercent;
    });
    
    // Área transparente después del último segmento
    if (lastPosition < 100) {
      gradientStops.push(`transparent ${lastPosition}%`);
      gradientStops.push(`transparent 100%`);
    }
    
    if (gradientStops.length > 0) {
      styles.background = `linear-gradient(to right, ${gradientStops.join(', ')})`;
    }
    
    setHighlightStyles(styles);
  }, [section.segments, section.content, shots, showRecordedInText]);

  // Aplicar estilos cuando cambien los segmentos
  useEffect(() => {
    createHighlightStyles();
  }, [createHighlightStyles]);

  // Limpiar segmentos que ya no existen en el contenido
  const cleanupInvalidSegments = useCallback((newContent: string) => {
    const validSegments = section.segments.filter(segment => {
      // Verificar si el texto del segmento sigue existiendo en el contenido
      const segmentText = segment.text.trim();
      if (!segmentText || !newContent.includes(segmentText)) {
        return false;
      }
      
      // Verificar si las posiciones son válidas
      if (segment.startIndex < 0 || segment.endIndex > newContent.length) {
        return false;
      }
      
      return true;
    });
    
    // Si hay segmentos inválidos, eliminarlos
    const invalidSegments = section.segments.filter(seg => 
      !validSegments.find(valid => valid.id === seg.id)
    );
    
    invalidSegments.forEach(segment => {
      onRemoveSegment(segment.id);
    });
  }, [section.segments, onRemoveSegment]);

  // Actualizar posiciones de segmentos cuando cambia el contenido
  const updateSegmentPositions = useCallback((newContent: string) => {
    section.segments.forEach(segment => {
      const segmentText = segment.text.trim();
      const newIndex = newContent.indexOf(segmentText);
      
      if (newIndex !== -1 && newIndex !== segment.startIndex) {
        // Actualizar posiciones si el texto se movió
        const updatedSegment = {
          ...segment,
          startIndex: newIndex,
          endIndex: newIndex + segmentText.length
        };
        
        // Aquí podrías llamar a una función de actualización si estuviera disponible
        // Por ahora, el hook manejará esto automáticamente
      }
    });
  }, [section.segments]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    
    // Limpiar segmentos inválidos
    cleanupInvalidSegments(newContent);
    
    // Actualizar posiciones de segmentos
    updateSegmentPositions(newContent);
    
    // Notificar el cambio de contenido
    onContentChange(newContent);
  };

  const handleStartEditInfo = (segmentId: string) => {
    const segment = section.segments.find(s => s.id === segmentId);
    if (segment) {
      setEditingInfo(segment.id);
      setInfoText(segment.information || '');
    }
  };

  const handleSaveInfo = () => {
    if (editingInfo) {
      onAddSegmentInfo(editingInfo, infoText);
      setEditingInfo(null);
      setInfoText('');
    }
  };

  const handleCancelEditInfo = () => {
    setEditingInfo(null);
    setInfoText('');
  };

  return (
    <TooltipProvider>
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                {section.collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 mb-1">
                  {sectionConfig.label}
                </CardTitle>
                {!section.collapsed && (
                  <p className="text-sm text-gray-600">{sectionConfig.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {section.segments.length > 0 && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRecordedInText(!showRecordedInText)}
                        className="h-8 w-8 p-0"
                      >
                        {showRecordedInText ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showRecordedInText ? 'Ocultar tachado de grabadas' : 'Mostrar tachado de grabadas'}
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="outline" className="text-xs">
                    {section.segments.length} {section.segments.length === 1 ? 'toma' : 'tomas'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        {!section.collapsed && (
          <CardContent>
            <div className="relative">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleContentChange}
                onMouseUp={onTextSelection}
                onKeyUp={onTextSelection}
                className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors whitespace-pre-wrap relative"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-satoshi, system-ui, sans-serif)',
                  ...highlightStyles
                }}
                data-placeholder={sectionConfig.placeholder}
              />
              
              {section.content === '' && (
                <div 
                  className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
                  style={{ fontSize: '16px' }}
                >
                  {sectionConfig.placeholder}
                </div>
              )}

              {/* Overlay para mostrar líneas tachadas en tomas grabadas */}
              {showRecordedInText && section.segments.some(s => isShotRecorded(s.shotId)) && (
                <div className="absolute inset-0 pointer-events-none">
                  {section.segments
                    .filter(segment => isShotRecorded(segment.shotId))
                    .map(segment => {
                      const startPercent = (segment.startIndex / (section.content?.length || 1)) * 100;
                      const endPercent = (segment.endIndex / (section.content?.length || 1)) * 100;
                      
                      return (
                        <div
                          key={`strikethrough-${segment.id}`}
                          className="absolute h-0.5 bg-gray-400"
                          style={{
                            left: `${startPercent}%`,
                            width: `${endPercent - startPercent}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                        />
                      );
                    })}
                </div>
              )}
            </div>

            {/* Gestión de segmentos */}
            {section.segments.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Tomas en esta sección:</div>
                {section.segments.map((segment) => {
                  const shotColor = getShotColor(segment.shotId);
                  const shotName = getShotName(segment.shotId);
                  const isRecorded = isShotRecorded(segment.shotId);
                  
                  return (
                    <div key={segment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: shotColor }}
                      />
                      <span className={`text-sm flex-1 ${isRecorded ? 'line-through opacity-60' : ''}`}>
                        {shotName}: "{segment.text.length > 30 ? segment.text.substring(0, 30) + '...' : segment.text}"
                      </span>
                      
                      {editingInfo === segment.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={infoText}
                            onChange={(e) => setInfoText(e.target.value)}
                            placeholder="Información adicional..."
                            className="h-6 text-xs w-40"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveInfo}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditInfo}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={isRecorded ? "default" : "outline"}
                                onClick={() => onToggleShotRecorded(segment.shotId!)}
                                className={`h-6 w-6 p-0 ${
                                  isRecorded 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : 'border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {isRecorded ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Camera className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isRecorded ? 'Marcar como pendiente' : 'Marcar como grabada'}
                            </TooltipContent>
                          </Tooltip>

                          {segment.information && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-6 p-0 text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">Información adicional</h4>
                                  <p className="text-sm text-gray-600">{segment.information}</p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEditInfo(segment.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Info
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRemoveSegment(segment.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default ScriptSection;

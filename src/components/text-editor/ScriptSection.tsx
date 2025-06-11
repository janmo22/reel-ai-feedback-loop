import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, X, Check, Eye, EyeOff, Camera } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  showRecordedShots: boolean;
  onToggleRecordedShotsVisibility: () => void;
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
  editorRef,
  showRecordedShots,
  onToggleRecordedShotsVisibility
}) => {
  const sectionConfig = SECTION_TYPES[section.type];
  const contentRef = useRef<HTMLDivElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [editingInfo, setEditingInfo] = useState<string | null>(null);
  const [infoText, setInfoText] = useState('');

  useEffect(() => {
    if (contentRef.current && section.segments.length > 0) {
      renderStyledContent();
    }
  }, [section.segments, section.content, hoveredSegment, showRecordedShots]);

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

  // Función para agrupar segmentos consecutivos con la misma toma
  const mergeConsecutiveSegments = (segments: TextSegment[]) => {
    if (segments.length === 0) return [];

    const sortedSegments = [...segments].sort((a, b) => a.startIndex - b.startIndex);
    const mergedGroups: Array<{
      shotId?: string;
      startIndex: number;
      endIndex: number;
      segments: TextSegment[];
      text: string;
    }> = [];

    let currentGroup = {
      shotId: sortedSegments[0].shotId,
      startIndex: sortedSegments[0].startIndex,
      endIndex: sortedSegments[0].endIndex,
      segments: [sortedSegments[0]],
      text: sortedSegments[0].text
    };

    for (let i = 1; i < sortedSegments.length; i++) {
      const segment = sortedSegments[i];
      
      // Si el segmento actual tiene la misma toma y es consecutivo (o muy cercano)
      if (segment.shotId === currentGroup.shotId && 
          segment.startIndex <= currentGroup.endIndex + 2) { // Permitir hasta 2 caracteres de separación (espacios)
        // Extender el grupo actual
        currentGroup.endIndex = Math.max(currentGroup.endIndex, segment.endIndex);
        currentGroup.segments.push(segment);
        // Actualizar el texto del grupo completo
        currentGroup.text = section.content.slice(currentGroup.startIndex, currentGroup.endIndex);
      } else {
        // Iniciar un nuevo grupo
        mergedGroups.push(currentGroup);
        currentGroup = {
          shotId: segment.shotId,
          startIndex: segment.startIndex,
          endIndex: segment.endIndex,
          segments: [segment],
          text: segment.text
        };
      }
    }
    
    // Añadir el último grupo
    mergedGroups.push(currentGroup);
    
    return mergedGroups;
  };

  const renderStyledContent = () => {
    if (!contentRef.current) return;

    const content = section.content;
    if (!content || section.segments.length === 0) {
      contentRef.current.innerHTML = content;
      return;
    }

    // Agrupar segmentos consecutivos con la misma toma
    const mergedGroups = mergeConsecutiveSegments(section.segments);

    let html = '';
    let lastIndex = 0;

    mergedGroups.forEach(group => {
      // Añadir texto antes del grupo
      if (group.startIndex > lastIndex) {
        html += content.slice(lastIndex, group.startIndex);
      }

      const shotColor = getShotColor(group.shotId);
      const shotName = getShotName(group.shotId);
      const isRecorded = isShotRecorded(group.shotId);
      
      // Determinar si debe mostrarse según el estado de grabación
      const shouldShow = showRecordedShots || !isRecorded;
      
      if (shouldShow) {
        // Usar el primer segmento del grupo para los datos
        const firstSegment = group.segments[0];
        const allInfo = group.segments
          .map(s => s.information)
          .filter(info => info && info.trim())
          .join(' | ');

        // Aplicar tachado si está grabado
        const strikethroughStyle = isRecorded ? 'text-decoration: line-through; opacity: 0.7;' : '';

        html += `<span 
          class="segment-highlight relative cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-sm border-b-2" 
          style="
            background-color: ${shotColor}20;
            border-bottom-color: ${shotColor};
            border-bottom-width: 3px;
            ${strikethroughStyle}
          "
          data-segment-id="${firstSegment.id}"
          data-shot-name="${shotName}"
          data-segment-info="${allInfo}"
          data-recorded="${isRecorded}"
          onmouseenter="this.style.backgroundColor = '${shotColor}40'"
          onmouseleave="this.style.backgroundColor = '${shotColor}20'"
        >${group.text}</span>`;
      } else {
        html += group.text;
      }

      lastIndex = group.endIndex;
    });

    // Añadir texto restante
    if (lastIndex < content.length) {
      html += content.slice(lastIndex);
    }

    contentRef.current.innerHTML = html;

    // Añadir event listeners después de renderizar
    const segmentElements = contentRef.current.querySelectorAll('.segment-highlight');
    segmentElements.forEach(element => {
      const segmentId = element.getAttribute('data-segment-id');
      
      element.addEventListener('mouseenter', () => {
        setHoveredSegment(segmentId);
      });
      
      element.addEventListener('mouseleave', () => {
        setHoveredSegment(null);
      });
    });
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    onContentChange(newContent);
  };

  const handleStartEditInfo = (groupId: string) => {
    // Usar el primer segmento del grupo para editar información
    const mergedGroups = mergeConsecutiveSegments(section.segments);
    const group = mergedGroups.find(g => g.segments[0].id === groupId);
    if (group) {
      const firstSegment = group.segments[0];
      setEditingInfo(firstSegment.id);
      setInfoText(firstSegment.information || '');
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

  const handleRemoveGroup = (groupId: string) => {
    // Remover todos los segmentos del grupo
    const mergedGroups = mergeConsecutiveSegments(section.segments);
    const group = mergedGroups.find(g => g.segments[0].id === groupId);
    if (group) {
      group.segments.forEach(segment => {
        onRemoveSegment(segment.id);
      });
    }
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
                        onClick={onToggleRecordedShotsVisibility}
                        className="h-8 w-8 p-0"
                      >
                        {showRecordedShots ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showRecordedShots ? 'Ocultar tomas grabadas' : 'Mostrar tomas grabadas'}
                    </TooltipContent>
                  </Tooltip>
                  <Badge variant="outline" className="text-xs">
                    {mergeConsecutiveSegments(section.segments).length} {mergeConsecutiveSegments(section.segments).length === 1 ? 'toma' : 'tomas'}
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
                className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-satoshi, system-ui, sans-serif)'
                }}
                data-placeholder={sectionConfig.placeholder}
              />
              
              {/* Display styled content */}
              <div
                ref={contentRef}
                className="absolute inset-0 pointer-events-none p-4 text-base leading-relaxed"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-satoshi, system-ui, sans-serif)',
                  color: 'transparent'
                }}
              />
              
              {section.content === '' && (
                <div 
                  className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
                  style={{ fontSize: '16px' }}
                >
                  {sectionConfig.placeholder}
                </div>
              )}

              {/* Hover tooltip para añadir información */}
              {hoveredSegment && (
                <div 
                  className="absolute z-10 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-auto"
                  style={{
                    top: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Añadir información</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEditInfo(hoveredSegment)}
                      className="h-4 w-4 p-0 text-white hover:bg-gray-700"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Mostrar información existente */}
                  {section.segments.find(s => s.id === hoveredSegment)?.information && (
                    <div className="mt-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                      {section.segments.find(s => s.id === hoveredSegment)?.information}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gestión de segmentos agrupados */}
            {section.segments.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Tomas en esta sección:</div>
                {mergeConsecutiveSegments(section.segments).map((group) => {
                  const shotColor = getShotColor(group.shotId);
                  const shotName = getShotName(group.shotId);
                  const isRecorded = isShotRecorded(group.shotId);
                  const firstSegment = group.segments[0];
                  const allInfo = group.segments
                    .map(s => s.information)
                    .filter(info => info && info.trim())
                    .join(' | ');
                  
                  return (
                    <div key={firstSegment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: shotColor }}
                      />
                      <span className={`text-sm flex-1 ${isRecorded ? 'line-through opacity-60' : ''}`}>
                        {shotName}: "{group.text.length > 30 ? group.text.substring(0, 30) + '...' : group.text}"
                      </span>
                      
                      {editingInfo === firstSegment.id ? (
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
                          {/* Botón para marcar como grabado */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={isRecorded ? "default" : "outline"}
                                onClick={() => onToggleShotRecorded(group.shotId!)}
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

                          {allInfo && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Info
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{allInfo}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEditInfo(firstSegment.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Info
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveGroup(firstSegment.id)}
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


import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, X, Check } from 'lucide-react';
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
  shots,
  editorRef
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
  }, [section.segments, section.content, hoveredSegment]);

  const getShotColor = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.color || '#3B82F6';
  };

  const getShotName = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.name || 'Sin toma';
  };

  const renderStyledContent = () => {
    if (!contentRef.current) return;

    const content = section.content;
    if (!content || section.segments.length === 0) {
      contentRef.current.innerHTML = content;
      return;
    }

    // Crear array de elementos con posiciones
    const elements: Array<{
      start: number;
      end: number;
      type: 'segment' | 'text';
      segment?: TextSegment;
      text?: string;
    }> = [];

    // Añadir segmentos
    section.segments.forEach(segment => {
      elements.push({
        start: segment.startIndex,
        end: segment.endIndex,
        type: 'segment',
        segment
      });
    });

    // Ordenar por posición de inicio
    elements.sort((a, b) => a.start - b.start);

    let html = '';
    let lastIndex = 0;

    elements.forEach(element => {
      // Añadir texto antes del segmento
      if (element.start > lastIndex) {
        html += content.slice(lastIndex, element.start);
      }

      if (element.type === 'segment' && element.segment) {
        const segment = element.segment;
        const shotColor = getShotColor(segment.shotId);
        const shotName = getShotName(segment.shotId);
        
        html += `<span 
          class="segment-highlight relative cursor-pointer transition-all duration-200" 
          style="
            background: linear-gradient(to top, ${shotColor}40 0%, ${shotColor}40 2px, transparent 2px, transparent 100%);
            border-bottom: 2px solid ${shotColor};
            padding: 1px 2px;
            margin: 0 1px;
            position: relative;
          "
          data-segment-id="${segment.id}"
          data-shot-name="${shotName}"
          data-segment-info="${segment.information || ''}"
          onmouseenter="this.style.backgroundColor = '${shotColor}20'"
          onmouseleave="this.style.backgroundColor = 'transparent'"
        >${segment.text}</span>`;
      }

      lastIndex = element.end;
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

  const handleStartEditInfo = (segmentId: string) => {
    const segment = section.segments.find(s => s.id === segmentId);
    setEditingInfo(segmentId);
    setInfoText(segment?.information || '');
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
            {section.segments.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {section.segments.length} {section.segments.length === 1 ? 'toma' : 'tomas'}
              </Badge>
            )}
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
                    top: '-30px',
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
                  
                  return (
                    <div key={segment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: shotColor }}
                      />
                      <span className="text-sm flex-1">{shotName}: "{segment.text.substring(0, 30)}..."</span>
                      
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
                          {segment.information && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Info
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{segment.information}</p>
                              </TooltipContent>
                            </Tooltip>
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

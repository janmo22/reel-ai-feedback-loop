
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, X, Check, Camera } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScriptSection as ScriptSectionType, SECTION_TYPES } from '@/hooks/use-text-editor';

interface ScriptSectionProps {
  section: ScriptSectionType;
  onContentChange: (content: string) => void;
  onTextSelection: () => void;
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
  const lastContentRef = useRef(section.content);
  const isComposingRef = useRef(false);

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

  // Aplicar estilos sin perder el cursor
  const applyHighlights = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    const currentRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const cursorOffset = currentRange ? {
      startContainer: currentRange.startContainer,
      startOffset: currentRange.startOffset,
      endContainer: currentRange.endContainer,
      endOffset: currentRange.endOffset
    } : null;

    // Obtener texto plano del editor
    const plainText = editorRef.current.textContent || '';
    
    // Crear estructura de nodos
    const nodes: (string | { text: string; segment: any })[] = [];
    let lastIndex = 0;

    // Ordenar segmentos por posición
    const sortedSegments = [...section.segments].sort((a, b) => a.startIndex - b.startIndex);

    sortedSegments.forEach(segment => {
      if (segment.startIndex > lastIndex) {
        nodes.push(plainText.substring(lastIndex, segment.startIndex));
      }
      
      nodes.push({
        text: plainText.substring(segment.startIndex, segment.endIndex),
        segment
      });
      
      lastIndex = segment.endIndex;
    });

    if (lastIndex < plainText.length) {
      nodes.push(plainText.substring(lastIndex));
    }

    // Limpiar y reconstruir el contenido
    editorRef.current.innerHTML = '';

    nodes.forEach(node => {
      if (typeof node === 'string') {
        // Texto normal - preservar saltos de línea
        const lines = node.split('\n');
        lines.forEach((line, index) => {
          if (line) {
            editorRef.current!.appendChild(document.createTextNode(line));
          }
          if (index < lines.length - 1) {
            editorRef.current!.appendChild(document.createElement('br'));
          }
        });
      } else {
        // Texto con highlight
        const span = document.createElement('span');
        const shotColor = getShotColor(node.segment.shotId);
        const isRecorded = isShotRecorded(node.segment.shotId);
        
        span.style.backgroundColor = `${shotColor}30`;
        span.style.borderBottom = `3px solid ${shotColor}`;
        span.style.padding = '1px 2px';
        span.style.borderRadius = '2px';
        span.style.fontWeight = '500';
        
        if (isRecorded) {
          span.style.textDecoration = 'line-through';
          span.style.opacity = '0.7';
        }
        
        span.dataset.segmentId = node.segment.id;
        span.className = 'segment-highlight';
        
        // Preservar saltos de línea dentro del segmento
        const lines = node.text.split('\n');
        lines.forEach((line, index) => {
          if (line) {
            span.appendChild(document.createTextNode(line));
          }
          if (index < lines.length - 1) {
            span.appendChild(document.createElement('br'));
          }
        });
        
        editorRef.current!.appendChild(span);
      }
    });

    // Restaurar cursor
    if (cursorOffset && selection) {
      try {
        const newRange = document.createRange();
        
        // Función para encontrar el nodo y offset correcto
        const findNodeAndOffset = (container: Node, offset: number) => {
          let currentNode: Node | null = editorRef.current!.firstChild;
          let currentOffset = 0;
          
          while (currentNode) {
            const nodeLength = currentNode.textContent?.length || 0;
            
            if (currentOffset + nodeLength >= offset) {
              if (currentNode.nodeType === Node.TEXT_NODE) {
                return { node: currentNode, offset: offset - currentOffset };
              } else if (currentNode.firstChild) {
                return findNodeAndOffset(currentNode.firstChild, offset - currentOffset);
              }
            }
            
            currentOffset += nodeLength;
            currentNode = currentNode.nextSibling;
          }
          
          return { node: editorRef.current!, offset: 0 };
        };
        
        const startPos = findNodeAndOffset(editorRef.current!, cursorOffset.startOffset);
        const endPos = findNodeAndOffset(editorRef.current!, cursorOffset.endOffset);
        
        newRange.setStart(startPos.node, startPos.offset);
        newRange.setEnd(endPos.node, endPos.offset);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        // Si falla la restauración del cursor, no hacer nada
      }
    }
  };

  // Efecto para aplicar highlights cuando cambian los segmentos
  useEffect(() => {
    if (editorRef.current && section.content) {
      applyHighlights();
    }
  }, [section.segments]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposingRef.current) return;
    
    const newContent = e.currentTarget.textContent || '';
    lastContentRef.current = newContent;
    onContentChange(newContent);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposingRef.current = false;
    handleInput(e as any);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount) {
      selection.deleteFromDocument();
      const textNode = document.createTextNode(text);
      selection.getRangeAt(0).insertNode(textNode);
      
      // Mover el cursor al final del texto pegado
      const range = document.createRange();
      range.selectNodeContents(textNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Actualizar contenido
      const newContent = editorRef.current?.textContent || '';
      onContentChange(newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Manejar Enter para preservar el formato
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        const br = document.createElement('br');
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(br);
        
        // Mover cursor después del br
        const newRange = document.createRange();
        newRange.setStartAfter(br);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Actualizar contenido
        const newContent = editorRef.current?.textContent || '';
        onContentChange(newContent);
      }
    }
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
                <Badge variant="outline" className="text-xs">
                  {section.segments.length} {section.segments.length === 1 ? 'toma' : 'tomas'}
                </Badge>
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
                onInput={handleInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                onMouseUp={onTextSelection}
                onKeyUp={onTextSelection}
                className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors whitespace-pre-wrap bg-white"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-satoshi, system-ui, sans-serif)',
                  direction: 'ltr',
                  textAlign: 'left',
                  unicodeBidi: 'normal'
                }}
              />
              
              {/* Placeholder */}
              {(!section.content || section.content === '') && (
                <div 
                  className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
                  style={{ 
                    fontSize: '16px',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                >
                  {sectionConfig.placeholder}
                </div>
              )}
            </div>

            {/* Lista de tomas */}
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

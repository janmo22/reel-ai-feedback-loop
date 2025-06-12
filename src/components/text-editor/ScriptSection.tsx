import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  onSegmentsUpdate: (segments: any[]) => void;
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
  onSegmentsUpdate,
  shots,
  editorRef
}) => {
  const sectionConfig = SECTION_TYPES[section.type];
  const [editingInfo, setEditingInfo] = useState<string | null>(null);
  const [infoText, setInfoText] = useState('');
  const isUpdatingRef = useRef(false);
  const lastCaretPositionRef = useRef<{node: Node | null, offset: number}>({ node: null, offset: 0 });

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

  // Guardar la posición del cursor
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      lastCaretPositionRef.current = {
        node: range.startContainer,
        offset: range.startOffset
      };
    }
  }, []);

  // Restaurar la posición del cursor
  const restoreCaretPosition = useCallback(() => {
    if (!editorRef.current || !lastCaretPositionRef.current.node) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();
      
      // Verificar si el nodo aún existe en el DOM
      if (editorRef.current.contains(lastCaretPositionRef.current.node)) {
        range.setStart(lastCaretPositionRef.current.node, lastCaretPositionRef.current.offset);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    } catch (e) {
      // Si falla, no hacer nada
    }
  }, []);

  // Obtener el offset absoluto en el texto plano
  const getAbsoluteOffset = useCallback((container: Node, offset: number): number => {
    if (!editorRef.current) return 0;
    
    let absoluteOffset = 0;
    let currentNode: Node | null = editorRef.current.firstChild;
    let found = false;

    const walkNodes = (node: Node | null) => {
      if (!node || found) return;

      if (node === container) {
        absoluteOffset += offset;
        found = true;
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        absoluteOffset += node.textContent?.length || 0;
      } else if (node.nodeName === 'BR') {
        absoluteOffset += 1;
      }

      if (node.firstChild) {
        walkNodes(node.firstChild);
      }
      if (!found && node.nextSibling) {
        walkNodes(node.nextSibling);
      }
    };

    walkNodes(currentNode);
    return absoluteOffset;
  }, []);

  // Aplicar highlights al contenido
  const applyHighlights = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return;

    isUpdatingRef.current = true;
    saveCaretPosition();

    const content = section.content;
    const segments = [...section.segments].sort((a, b) => a.startIndex - b.startIndex);

    // Limpiar el editor
    editorRef.current.innerHTML = '';

    let lastIndex = 0;

    segments.forEach(segment => {
      // Agregar texto antes del segmento
      if (segment.startIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, segment.startIndex);
        const lines = textBefore.split('\n');
        lines.forEach((line, idx) => {
          if (line) {
            editorRef.current!.appendChild(document.createTextNode(line));
          }
          if (idx < lines.length - 1) {
            editorRef.current!.appendChild(document.createElement('br'));
          }
        });
      }

      // Crear el span con highlight
      const span = document.createElement('span');
      const shotColor = getShotColor(segment.shotId);
      const isRecorded = isShotRecorded(segment.shotId);
      
      span.style.backgroundColor = `${shotColor}30`;
      span.style.borderBottom = `3px solid ${shotColor}`;
      span.style.padding = '1px 2px';
      span.style.borderRadius = '2px';
      span.style.fontWeight = '500';
      
      if (isRecorded) {
        span.style.textDecoration = 'line-through';
        span.style.opacity = '0.7';
      }
      
      span.dataset.segmentId = segment.id;
      span.dataset.shotId = segment.shotId || '';
      span.className = 'segment-highlight';
      
      // Agregar el texto del segmento
      const segmentText = content.substring(segment.startIndex, segment.endIndex);
      const lines = segmentText.split('\n');
      lines.forEach((line, idx) => {
        if (line) {
          span.appendChild(document.createTextNode(line));
        }
        if (idx < lines.length - 1) {
          span.appendChild(document.createElement('br'));
        }
      });
      
      editorRef.current!.appendChild(span);
      lastIndex = segment.endIndex;
    });

    // Agregar texto restante
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      const lines = remainingText.split('\n');
      lines.forEach((line, idx) => {
        if (line) {
          editorRef.current!.appendChild(document.createTextNode(line));
        }
        if (idx < lines.length - 1) {
          editorRef.current!.appendChild(document.createElement('br'));
        }
      });
    }

    // Si no hay contenido, asegurar que haya al menos un nodo de texto
    if (!editorRef.current.firstChild) {
      editorRef.current.appendChild(document.createTextNode(''));
    }

    setTimeout(() => {
      restoreCaretPosition();
      isUpdatingRef.current = false;
    }, 0);
  }, [section.content, section.segments, getShotColor, isShotRecorded, saveCaretPosition, restoreCaretPosition]);

  // Aplicar highlights cuando cambien los segmentos o el contenido
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      applyHighlights();
    }
  }, [section.segments, applyHighlights]);

  // Detectar si el cursor está dentro de un segmento
  const getCurrentSegment = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    // Buscar el span padre si estamos en un nodo de texto
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && 
          (node as HTMLElement).classList?.contains('segment-highlight')) {
        return {
          element: node as HTMLElement,
          segmentId: (node as HTMLElement).dataset.segmentId,
          shotId: (node as HTMLElement).dataset.shotId
        };
      }
      node = node.parentNode as Node;
    }

    return null;
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdatingRef.current) return;

    const newContent = e.currentTarget.textContent || '';
    onContentChange(newContent);

    // Verificar si estamos escribiendo dentro de un segmento
    const currentSegment = getCurrentSegment();
    if (currentSegment && currentSegment.segmentId) {
      // Actualizar el segmento para incluir el nuevo texto
      const segmentElement = currentSegment.element;
      const segmentText = segmentElement.textContent || '';
      
      // Calcular la nueva posición del segmento
      const absoluteStart = getAbsoluteOffset(segmentElement, 0);
      const absoluteEnd = absoluteStart + segmentText.length;

      // Actualizar el segmento
      const updatedSegments = section.segments.map(seg => {
        if (seg.id === currentSegment.segmentId) {
          return {
            ...seg,
            text: segmentText,
            startIndex: absoluteStart,
            endIndex: absoluteEnd
          };
        }
        return seg;
      });

      onSegmentsUpdate(updatedSegments);
    }
  }, [getCurrentSegment, getAbsoluteOffset, section.segments, onContentChange, onSegmentsUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const currentSegment = getCurrentSegment();

      // Insertar un salto de línea
      const br = document.createElement('br');
      range.deleteContents();
      range.insertNode(br);

      // Si estamos dentro de un segmento, mantenerlo
      if (currentSegment && currentSegment.element) {
        // Crear un nodo de texto vacío después del br para poder posicionar el cursor
        const emptyText = document.createTextNode('');
        if (br.nextSibling) {
          br.parentNode?.insertBefore(emptyText, br.nextSibling);
        } else {
          br.parentNode?.appendChild(emptyText);
        }

        // Mover el cursor después del br
        const newRange = document.createRange();
        newRange.setStart(emptyText, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Si no estamos en un segmento, crear un nodo de texto después del br
        const textNode = document.createTextNode('\u200B'); // Zero-width space
        if (br.nextSibling) {
          br.parentNode?.insertBefore(textNode, br.nextSibling);
        } else {
          editorRef.current?.appendChild(textNode);
        }

        // Mover el cursor
        const newRange = document.createRange();
        newRange.setStart(textNode, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      // Actualizar el contenido
      const newContent = editorRef.current?.textContent || '';
      onContentChange(newContent);
    }
  }, [getCurrentSegment, onContentChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
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
  }, [onContentChange]);

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
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                onMouseUp={onTextSelection}
                onKeyUp={onTextSelection}
                className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors whitespace-pre-wrap bg-white"
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-satoshi, system-ui, sans-serif)'
                }}
              />
              
              {/* Placeholder */}
              {(!section.content || section.content === '') && (
                <div 
                  className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
                  style={{ fontSize: '16px' }}
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

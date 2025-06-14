
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Shot {
  id: string;
  name: string;
  color: string;
  recorded?: boolean;
}

interface TextSegment {
  id: string;
  text: string;
  shotId?: string;
  color?: string;
  startIndex: number;
  endIndex: number;
  information?: string;
}

interface SimpleTextEditorProps {
  title: string;
  description: string;
  placeholder: string;
  content: string;
  segments: TextSegment[];
  collapsed: boolean;
  shots: Shot[];
  onContentChange: (content: string) => void;
  onSegmentsChange: (segments: TextSegment[]) => void;
  onTextSelection: () => void;
  onToggleCollapse: () => void;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  segments,
  collapsed,
  shots,
  onContentChange,
  onSegmentsChange,
  onTextSelection,
  onToggleCollapse
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para aplicar highlights sin perder el cursor
  const applyHighlights = useCallback(() => {
    if (!editorRef.current || isUpdating || !content) return;

    setIsUpdating(true);
    
    // Guardar la posición del cursor
    const selection = window.getSelection();
    let caretOffset = 0;
    let focusNode = null;

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      focusNode = range.startContainer;
      caretOffset = range.startOffset;
      
      // Si el focus está en un nodo de texto, necesitamos calcular el offset global
      if (focusNode && focusNode.nodeType === Node.TEXT_NODE) {
        let textOffset = 0;
        const walker = document.createTreeWalker(
          editorRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        while (walker.nextNode()) {
          if (walker.currentNode === focusNode) {
            caretOffset = textOffset + caretOffset;
            break;
          }
          textOffset += walker.currentNode.textContent?.length || 0;
        }
      }
    }

    // Limpiar y crear el nuevo HTML
    let html = '';
    let lastIndex = 0;
    
    // Ordenar segmentos por posición
    const sortedSegments = [...segments]
      .filter(seg => seg.startIndex >= 0 && seg.endIndex <= content.length)
      .sort((a, b) => a.startIndex - b.startIndex);
    
    for (const segment of sortedSegments) {
      // Texto antes del segmento
      if (segment.startIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, segment.startIndex);
        html += escapeHtml(textBefore).replace(/\n/g, '<br>');
      }
      
      // Segmento con highlight
      const segmentText = content.substring(segment.startIndex, segment.endIndex);
      const shot = shots.find(s => s.id === segment.shotId);
      const backgroundColor = segment.color || shot?.color || '#3B82F6';
      const isRecorded = shot?.recorded || false;
      
      html += `<span 
        class="segment-highlight" 
        data-segment-id="${segment.id}"
        style="
          background-color: ${backgroundColor}20;
          border-bottom: 2px solid ${backgroundColor};
          padding: 1px 2px;
          border-radius: 2px;
          ${isRecorded ? 'text-decoration: line-through; opacity: 0.7;' : ''}
        "
      >${escapeHtml(segmentText).replace(/\n/g, '<br>')}</span>`;
      
      lastIndex = segment.endIndex;
    }
    
    // Texto restante
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      html += escapeHtml(remainingText).replace(/\n/g, '<br>');
    }
    
    editorRef.current.innerHTML = html;
    
    // Restaurar cursor
    setTimeout(() => {
      if (editorRef.current && selection) {
        try {
          const range = document.createRange();
          const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let currentPos = 0;
          let targetNode = null;
          let targetOffset = 0;
          
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent?.length || 0;
            
            if (currentPos + nodeLength >= caretOffset) {
              targetNode = node;
              targetOffset = caretOffset - currentPos;
              break;
            }
            currentPos += nodeLength;
          }
          
          if (targetNode) {
            range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (e) {
          console.log('Error restaurando cursor:', e);
        }
      }
      setIsUpdating(false);
    }, 0);
  }, [content, segments, shots, isUpdating]);

  // Función para escapar HTML
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Aplicar highlights cuando cambian los datos
  useEffect(() => {
    if (!isUpdating) {
      applyHighlights();
    }
  }, [segments, shots, applyHighlights, isUpdating]);

  // Manejar cambios en el contenido
  const handleInput = useCallback(() => {
    if (isUpdating || !editorRef.current) return;
    
    const newContent = editorRef.current.textContent || '';
    console.log('Contenido actualizado:', newContent);
    
    // Actualizar contenido inmediatamente
    onContentChange(newContent);
    
    // Actualizar posiciones de segmentos
    const updatedSegments = segments.map(segment => {
      const segmentIndex = newContent.indexOf(segment.text);
      if (segmentIndex !== -1 && newContent.substring(segmentIndex, segmentIndex + segment.text.length) === segment.text) {
        return {
          ...segment,
          startIndex: segmentIndex,
          endIndex: segmentIndex + segment.text.length
        };
      }
      return null;
    }).filter(Boolean) as TextSegment[];
    
    // Solo actualizar segmentos si hay cambios
    if (updatedSegments.length !== segments.length || 
        updatedSegments.some((seg, i) => seg.startIndex !== segments[i]?.startIndex)) {
      onSegmentsChange(updatedSegments);
    }
  }, [segments, onContentChange, onSegmentsChange, isUpdating]);

  // Manejar Enter para saltos de línea
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode('\n');
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Actualizar contenido
        setTimeout(() => {
          handleInput();
        }, 0);
      }
    }
  }, [handleInput]);

  return (
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
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 mb-1">
                {title}
              </CardTitle>
              {!collapsed && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {segments.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {segments.length} {segments.length === 1 ? 'toma' : 'tomas'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent>
          <div className="relative">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onMouseUp={onTextSelection}
              onKeyUp={onTextSelection}
              className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors bg-white"
              style={{
                direction: 'ltr',
                textAlign: 'left',
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            />

            {/* Placeholder */}
            {(!content || content === '') && (
              <div
                className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
                style={{ fontSize: '16px' }}
              >
                {placeholder}
              </div>
            )}
          </div>

          {/* Lista de tomas */}
          {segments.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Tomas en esta sección:
              </div>
              {segments.map((segment) => {
                const shot = shots.find(s => s.id === segment.shotId);
                const isRecorded = shot?.recorded || false;
                const color = segment.color || shot?.color || '#3B82F6';
                
                return (
                  <div key={segment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    <span className={`text-sm flex-1 ${isRecorded ? 'line-through opacity-60' : ''}`}>
                      {shot?.name || 'Toma'}: "{segment.text.length > 30 ? segment.text.substring(0, 30) + '...' : segment.text}"
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SimpleTextEditor;

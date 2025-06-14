
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

interface Segment {
  id: string;
  text: string;
  shotId: string;
  color: string;
  startIndex: number;
  endIndex: number;
}

interface SimpleTextEditorProps {
  title: string;
  description: string;
  placeholder: string;
  content: string;
  segments: Segment[];
  collapsed: boolean;
  shots: Shot[];
  onContentChange: (content: string) => void;
  onSegmentsChange: (segments: Segment[]) => void;
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
  const isUpdatingRef = useRef(false);

  // Aplicar highlights
  const applyHighlights = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current || !content) return;

    isUpdatingRef.current = true;
    
    // Guardar posición del cursor
    const selection = window.getSelection();
    let caretPosition = 0;
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      caretPosition = range.startOffset;
    }

    // Crear HTML con highlights
    let html = '';
    let lastIndex = 0;
    
    // Ordenar segmentos por posición
    const sortedSegments = [...segments].sort((a, b) => a.startIndex - b.startIndex);
    
    sortedSegments.forEach(segment => {
      // Texto antes del segmento
      if (segment.startIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, segment.startIndex);
        html += textBefore.replace(/\n/g, '<br>');
      }
      
      // Segmento con highlight
      const segmentText = content.substring(segment.startIndex, segment.endIndex);
      const shot = shots.find(s => s.id === segment.shotId);
      const isRecorded = shot?.recorded || false;
      
      html += `<span 
        class="segment-highlight" 
        data-segment-id="${segment.id}"
        data-shot-id="${segment.shotId}"
        style="
          background-color: ${segment.color}30;
          border-bottom: 3px solid ${segment.color};
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 500;
          ${isRecorded ? 'text-decoration: line-through; opacity: 0.7;' : ''}
        "
      >${segmentText.replace(/\n/g, '<br>')}</span>`;
      
      lastIndex = segment.endIndex;
    });
    
    // Texto restante
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      html += remainingText.replace(/\n/g, '<br>');
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
            
            if (currentPos + nodeLength >= caretPosition) {
              targetNode = node;
              targetOffset = caretPosition - currentPos;
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
          // Ignorar errores de cursor
        }
      }
      isUpdatingRef.current = false;
    }, 0);
  }, [content, segments, shots]);

  // Aplicar highlights cuando cambien los segmentos
  useEffect(() => {
    applyHighlights();
  }, [segments, applyHighlights]);

  // Manejar entrada de texto
  const handleInput = useCallback(() => {
    if (isUpdatingRef.current || !editorRef.current) return;
    
    const newContent = editorRef.current.textContent || '';
    onContentChange(newContent);
    
    // Actualizar posiciones de segmentos existentes
    const updatedSegments = segments.map(segment => {
      const segmentIndex = newContent.indexOf(segment.text);
      if (segmentIndex !== -1) {
        return {
          ...segment,
          startIndex: segmentIndex,
          endIndex: segmentIndex + segment.text.length
        };
      }
      return segment;
    }).filter(segment => newContent.includes(segment.text));
    
    if (updatedSegments.length !== segments.length) {
      onSegmentsChange(updatedSegments);
    }
  }, [segments, onContentChange, onSegmentsChange]);

  // Manejar Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const br = document.createElement('br');
        range.insertNode(br);
        
        // Posicionar cursor después del br
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Actualizar contenido
        const newContent = editorRef.current?.textContent || '';
        onContentChange(newContent);
      }
    }
  }, [onContentChange]);

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
                fontFamily: 'var(--font-satoshi, system-ui, sans-serif)'
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
                
                return (
                  <div key={segment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className={`text-sm flex-1 ${isRecorded ? 'line-through opacity-60' : ''}`}>
                      {shot?.name}: "{segment.text.length > 30 ? segment.text.substring(0, 30) + '...' : segment.text}"
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

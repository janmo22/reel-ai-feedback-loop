
import React, { useEffect, useState, useRef } from 'react';
import { TextSegment } from '@/hooks/use-text-editor';

interface HighlightOverlayProps {
  segments: TextSegment[];
  content: string;
  editorRef: React.RefObject<HTMLDivElement>;
  shots: any[];
}

interface HighlightRect {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
}

const HighlightOverlay: React.FC<HighlightOverlayProps> = ({
  segments,
  content,
  editorRef,
  shots
}) => {
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getShotColor = (shotId?: string) => {
    const shot = shots.find(s => s.id === shotId);
    return shot?.color || '#3B82F6';
  };

  const calculateHighlights = () => {
    const editor = editorRef.current;
    const overlay = overlayRef.current;
    
    if (!editor || !overlay || !content) {
      setHighlights([]);
      return;
    }

    const newHighlights: HighlightRect[] = [];
    
    segments.forEach(segment => {
      try {
        // Verificar que el segmento aún existe en el contenido
        if (segment.startIndex < 0 || segment.endIndex > content.length) return;
        
        const range = document.createRange();
        const walker = document.createTreeWalker(
          editor,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let currentIndex = 0;
        let startNode: Node | null = null;
        let endNode: Node | null = null;
        let startOffset = 0;
        let endOffset = 0;
        
        // Encontrar nodos de inicio y fin
        let node;
        while (node = walker.nextNode()) {
          const nodeLength = node.textContent?.length || 0;
          
          if (!startNode && currentIndex + nodeLength >= segment.startIndex) {
            startNode = node;
            startOffset = segment.startIndex - currentIndex;
          }
          
          if (!endNode && currentIndex + nodeLength >= segment.endIndex) {
            endNode = node;
            endOffset = segment.endIndex - currentIndex;
            break;
          }
          
          currentIndex += nodeLength;
        }
        
        if (startNode && endNode) {
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          
          const rects = range.getClientRects();
          const editorRect = editor.getBoundingClientRect();
          
          Array.from(rects).forEach((rect, index) => {
            newHighlights.push({
              id: `${segment.id}-${index}`,
              left: rect.left - editorRect.left,
              top: rect.top - editorRect.top,
              width: rect.width,
              height: rect.height,
              color: getShotColor(segment.shotId)
            });
          });
        }
      } catch (error) {
        console.log('Error calculating highlight for segment:', segment.id, error);
      }
    });
    
    setHighlights(newHighlights);
  };

  useEffect(() => {
    calculateHighlights();
  }, [segments, content]);

  useEffect(() => {
    const handleResize = () => calculateHighlights();
    const handleScroll = () => calculateHighlights();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {highlights.map(highlight => (
        <div
          key={highlight.id}
          className="absolute"
          style={{
            left: highlight.left,
            top: highlight.top + highlight.height - 3,
            width: highlight.width,
            height: '3px',
            backgroundColor: highlight.color,
            borderRadius: '1px',
            opacity: 0.8
          }}
        />
      ))}
    </div>
  );
};

export default HighlightOverlay;

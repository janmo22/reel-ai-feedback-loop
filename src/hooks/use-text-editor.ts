
import { useState, useRef, useCallback } from 'react';

export interface TextSegment {
  id: string;
  text: string;
  shotId?: string;
  color?: string;
  startIndex: number;
  endIndex: number;
  information?: string;
}

export interface Shot {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Inspiration {
  id: string;
  url: string;
  title: string;
  notes: string;
  timestamp?: string;
}

export const useTextEditor = () => {
  const [content, setContent] = useState('');
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [selectedText, setSelectedText] = useState<{ text: string; range: Range | null }>({ text: '', range: null });
  const [showShotMenu, setShowShotMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && editorRef.current) {
      const text = selection.toString();
      const range = selection.getRangeAt(0);
      
      setSelectedText({ text, range });
      
      // Get position for menu
      const rect = range.getBoundingClientRect();
      setMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowShotMenu(true);
    } else {
      setShowShotMenu(false);
    }
  }, []);

  const addShot = useCallback((name: string, color: string, description?: string) => {
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      name,
      color,
      description
    };
    setShots(prev => [...prev, newShot]);
    return newShot;
  }, []);

  const findTextPosition = useCallback((text: string, content: string) => {
    const startIndex = content.indexOf(text);
    if (startIndex === -1) return { startIndex: 0, endIndex: 0 };
    return {
      startIndex,
      endIndex: startIndex + text.length
    };
  }, []);

  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const { startIndex, endIndex } = findTextPosition(selectedText.text, content);

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex,
      endIndex
    };

    setSegments(prev => [...prev, newSegment]);
    setShowShotMenu(false);
    setSelectedText({ text: '', range: null });
  }, [selectedText, shots, content, findTextPosition]);

  const applySegmentStyling = useCallback(() => {
    if (!editorRef.current || segments.length === 0) return;

    const editor = editorRef.current;
    const textContent = editor.textContent || '';
    
    // Remove existing highlights
    const existingHighlights = editor.querySelectorAll('.text-segment-highlight');
    existingHighlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });

    // Apply new highlights
    segments.forEach(segment => {
      const shot = shots.find(s => s.id === segment.shotId);
      if (!shot) return;

      const walker = document.createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        const textNode = node as Text;
        const nodeText = textNode.textContent || '';
        const segmentIndex = nodeText.indexOf(segment.text);
        
        if (segmentIndex !== -1) {
          const range = document.createRange();
          range.setStart(textNode, segmentIndex);
          range.setEnd(textNode, segmentIndex + segment.text.length);
          
          const span = document.createElement('span');
          span.className = 'text-segment-highlight';
          span.style.backgroundColor = `${shot.color}20`; // 20% opacity
          span.style.color = shot.color;
          span.style.fontWeight = '500';
          span.style.borderRadius = '3px';
          span.style.padding = '1px 2px';
          span.style.position = 'relative';
          
          // Add indicator for segments with information
          if (segment.information) {
            span.style.borderLeft = `3px solid ${shot.color}`;
            span.style.paddingLeft = '6px';
            span.title = 'Este segmento tiene información adicional';
          }
          
          try {
            range.surroundContents(span);
          } catch (e) {
            // If we can't surround contents, create a new span with the text
            span.textContent = segment.text;
            range.deleteContents();
            range.insertNode(span);
          }
          
          break;
        }
      }
    });
  }, [segments, shots]);

  const addInspiration = useCallback((url: string, title: string, notes: string, timestamp?: string) => {
    const newInspiration: Inspiration = {
      id: `inspiration-${Date.now()}`,
      url,
      title,
      notes,
      timestamp
    };
    setInspirations(prev => [...prev, newInspiration]);
  }, []);

  const updateSegmentInfo = useCallback((segmentId: string, information: string) => {
    setSegments(prev => prev.map(segment => 
      segment.id === segmentId ? { ...segment, information } : segment
    ));
  }, []);

  return {
    content,
    setContent,
    segments,
    shots,
    inspirations,
    selectedText,
    showShotMenu,
    menuPosition,
    editorRef,
    handleTextSelection,
    addShot,
    assignShotToText,
    addInspiration,
    updateSegmentInfo,
    setShowShotMenu,
    applySegmentStyling
  };
};

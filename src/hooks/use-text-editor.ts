
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

  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex: 0, // This would need proper calculation in a real implementation
      endIndex: selectedText.text.length
    };

    setSegments(prev => [...prev, newSegment]);
    setShowShotMenu(false);
    setSelectedText({ text: '', range: null });
  }, [selectedText, shots]);

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
    setShowShotMenu
  };
};

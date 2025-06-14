
import { useState, useCallback, useRef } from 'react';

export interface Shot {
  id: string;
  name: string;
  color: string;
  textSegments: TextSegment[];
}

export interface TextSegment {
  id: string;
  text: string;
  shotId: string;
  startIndex: number;
  endIndex: number;
}

export interface CreativeItem {
  id: string;
  type: 'note' | 'image' | 'video';
  content: string;
  url?: string;
  timestamp: number;
}

export const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316'  // Orange
];

export const useAdvancedEditor = (initialContent = '') => {
  const [content, setContent] = useState(initialContent);
  const [shots, setShots] = useState<Shot[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [creativeItems, setCreativeItems] = useState<CreativeItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createShot = useCallback((name: string, color: string) => {
    if (!selectedText || !selectionRange) return null;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      name,
      color,
      textSegments: []
    };

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText,
      shotId: newShot.id,
      startIndex: selectionRange.start,
      endIndex: selectionRange.end
    };

    newShot.textSegments.push(newSegment);
    setShots(prev => [...prev, newShot]);
    
    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
    
    return newShot;
  }, [selectedText, selectionRange]);

  const assignToExistingShot = useCallback((shotId: string) => {
    if (!selectedText || !selectionRange) return;

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText,
      shotId,
      startIndex: selectionRange.start,
      endIndex: selectionRange.end
    };

    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? { ...shot, textSegments: [...shot.textSegments, newSegment] }
        : shot
    ));

    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
  }, [selectedText, selectionRange]);

  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = content.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  }, [content]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    // Update segment indices based on content changes
    // This is a simplified version - in production you'd want more sophisticated tracking
  }, []);

  const addCreativeItem = useCallback((type: CreativeItem['type'], content: string, url?: string) => {
    const newItem: CreativeItem = {
      id: `creative-${Date.now()}`,
      type,
      content,
      url,
      timestamp: Date.now()
    };
    setCreativeItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const removeCreativeItem = useCallback((id: string) => {
    setCreativeItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getShotForText = useCallback((index: number): Shot | null => {
    for (const shot of shots) {
      for (const segment of shot.textSegments) {
        if (index >= segment.startIndex && index <= segment.endIndex) {
          return shot;
        }
      }
    }
    return null;
  }, [shots]);

  return {
    content,
    shots,
    selectedText,
    selectionRange,
    creativeItems,
    textareaRef,
    updateContent,
    createShot,
    assignToExistingShot,
    handleTextSelection,
    addCreativeItem,
    removeCreativeItem,
    getShotForText
  };
};

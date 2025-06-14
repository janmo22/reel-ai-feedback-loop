import { useState, useCallback, useRef } from 'react';

export interface ShotInfo {
  id: string;
  label: string;
  value: string;
}

export interface Shot {
  id: string;
  name: string;
  color: string;
  textSegments: TextSegment[];
  additionalInfo: ShotInfo[];
}

export interface TextSegment {
  id: string;
  text: string;
  shotId: string;
  startIndex: number;
  endIndex: number;
  isStrikethrough?: boolean;
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

  // Helper function to check if text contains only whitespace
  const isOnlyWhitespace = useCallback((text: string) => {
    return /^\s*$/.test(text);
  }, []);

  // Helper function to find overlapping segments
  const findOverlappingSegments = useCallback((startIndex: number, endIndex: number) => {
    const overlapping: { shot: Shot; segment: TextSegment }[] = [];
    
    shots.forEach(shot => {
      shot.textSegments.forEach(segment => {
        if (!(endIndex <= segment.startIndex || startIndex >= segment.endIndex + 1)) {
          overlapping.push({ shot, segment });
        }
      });
    });
    
    return overlapping;
  }, [shots]);

  // Helper function to expand shot boundaries when text is added within
  const expandShotBoundaries = useCallback((newContent: string) => {
    setShots(prevShots => {
      return prevShots.map(shot => ({
        ...shot,
        textSegments: shot.textSegments.map(segment => {
          // Find the actual boundaries of the shot in the new content
          let expandedStart = segment.startIndex;
          let expandedEnd = segment.endIndex;
          
          // Expand backwards to include any new text at the beginning
          while (expandedStart > 0 && /\S/.test(newContent[expandedStart - 1])) {
            // Check if this character belongs to another shot
            const hasOtherShot = prevShots.some(otherShot => 
              otherShot.id !== shot.id && 
              otherShot.textSegments.some(otherSegment => 
                expandedStart - 1 >= otherSegment.startIndex && 
                expandedStart - 1 <= otherSegment.endIndex
              )
            );
            if (hasOtherShot) break;
            expandedStart--;
          }
          
          // Expand forwards to include any new text at the end
          while (expandedEnd < newContent.length - 1 && /\S/.test(newContent[expandedEnd + 1])) {
            // Check if this character belongs to another shot
            const hasOtherShot = prevShots.some(otherShot => 
              otherShot.id !== shot.id && 
              otherShot.textSegments.some(otherSegment => 
                expandedEnd + 1 >= otherSegment.startIndex && 
                expandedEnd + 1 <= otherSegment.endIndex
              )
            );
            if (hasOtherShot) break;
            expandedEnd++;
          }
          
          return {
            ...segment,
            startIndex: expandedStart,
            endIndex: expandedEnd,
            text: newContent.slice(expandedStart, expandedEnd + 1)
          };
        }).filter(segment => 
          segment.startIndex >= 0 && 
          segment.endIndex < newContent.length &&
          segment.startIndex <= segment.endIndex &&
          !isOnlyWhitespace(segment.text)
        )
      })).filter(shot => shot.textSegments.length > 0);
    });
  }, [isOnlyWhitespace]);

  const createShot = useCallback((name: string, color: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) return null;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    // Remove overlapping segments from other shots
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.filter(segment => 
            !overlapping.some(overlap => 
              overlap.shot.id === shot.id && overlap.segment.id === segment.id
            )
          )
        })).filter(shot => shot.textSegments.length > 0)
      );
    }

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      name,
      color,
      textSegments: [],
      additionalInfo: []
    };

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText,
      shotId: newShot.id,
      startIndex: start,
      endIndex: end,
      isStrikethrough: false
    };

    newShot.textSegments.push(newSegment);
    setShots(prev => [...prev, newShot]);
    
    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
    
    return newShot;
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments]);

  const assignToExistingShot = useCallback((shotId: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) return;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    // Remove overlapping segments from other shots
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.filter(segment => 
            !overlapping.some(overlap => 
              overlap.shot.id === shot.id && overlap.segment.id === segment.id
            )
          )
        })).filter(shot => shot.textSegments.length > 0)
      );
    }

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText,
      shotId,
      startIndex: start,
      endIndex: end,
      isStrikethrough: false
    };

    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? { ...shot, textSegments: [...shot.textSegments, newSegment] }
        : shot
    ));

    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments]);

  const updateShotSegments = useCallback((newContent: string) => {
    setShots(prevShots => {
      return prevShots.map(shot => ({
        ...shot,
        textSegments: shot.textSegments.map(segment => {
          // Update segment text based on current indices
          const currentText = newContent.slice(segment.startIndex, segment.endIndex + 1);
          return {
            ...segment,
            text: currentText
          };
        }).filter(segment => 
          // Remove segments that are out of bounds
          segment.startIndex >= 0 && 
          segment.endIndex < newContent.length &&
          segment.startIndex <= segment.endIndex
        )
      })).filter(shot => shot.textSegments.length > 0); // Remove shots with no segments
    });
  }, []);

  const toggleTextStrikethrough = useCallback((segmentId: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, isStrikethrough: !segment.isStrikethrough }
          : segment
      )
    })));
  }, []);

  const addShotInfo = useCallback((shotId: string, label: string, value: string) => {
    const newInfo: ShotInfo = {
      id: `info-${Date.now()}`,
      label,
      value
    };

    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? { ...shot, additionalInfo: [...shot.additionalInfo, newInfo] }
        : shot
    ));
  }, []);

  const updateShotInfo = useCallback((shotId: string, infoId: string, label: string, value: string) => {
    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? {
            ...shot,
            additionalInfo: shot.additionalInfo.map(info =>
              info.id === infoId ? { ...info, label, value } : info
            )
          }
        : shot
    ));
  }, []);

  const removeShotInfo = useCallback((shotId: string, infoId: string) => {
    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? {
            ...shot,
            additionalInfo: shot.additionalInfo.filter(info => info.id !== infoId)
          }
        : shot
    ));
  }, []);

  const handleTextSelection = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      const selected = content.substring(start, end);
      // Only allow selection of non-whitespace text
      if (!isOnlyWhitespace(selected)) {
        setSelectedText(selected);
        setSelectionRange({ start, end });
      } else {
        setSelectedText('');
        setSelectionRange(null);
      }
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  }, [content, isOnlyWhitespace]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    expandShotBoundaries(newContent);
  }, [expandShotBoundaries]);

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
    getShotForText,
    toggleTextStrikethrough,
    updateShotSegments,
    addShotInfo,
    updateShotInfo,
    removeShotInfo
  };
};

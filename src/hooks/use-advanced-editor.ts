import { useState, useCallback, useRef, useEffect } from 'react';

export interface ShotInfo {
  id: string;
  label: string;
  value: string;
}

export interface TextSegment {
  id: string;
  text: string;
  shotId: string;
  startIndex: number;
  endIndex: number;
  isStrikethrough?: boolean;
  additionalInfo?: string;
}

export interface Shot {
  id: string;
  name: string;
  color: string;
  textSegments: TextSegment[];
  additionalInfo: ShotInfo[];
}

export interface CreativeItem {
  id: string;
  type: 'note' | 'image' | 'video';
  content: string;
  url?: string;
  file?: File;
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

  // Sync with initial content only when it actually changes from parent
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent);
    }
  }, [initialContent]); // Remove content from dependencies to prevent loop

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

  // Improved updateContent function that doesn't trigger infinite loops
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
    
    // Update shot boundaries when content changes
    if (shots.length > 0) {
      setShots(prevShots => {
        return prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.map(segment => {
            // Ensure segment indices are within bounds
            const adjustedStart = Math.max(0, Math.min(segment.startIndex, newContent.length - 1));
            const adjustedEnd = Math.max(adjustedStart, Math.min(segment.endIndex, newContent.length - 1));
            
            // Only keep segment if it has valid content
            if (adjustedStart >= newContent.length || adjustedEnd >= newContent.length) {
              return null;
            }

            const segmentText = newContent.slice(adjustedStart, adjustedEnd + 1);
            
            // Keep segment only if it has meaningful content
            if (isOnlyWhitespace(segmentText)) {
              return null;
            }

            return {
              ...segment,
              startIndex: adjustedStart,
              endIndex: adjustedEnd,
              text: segmentText
            };
          }).filter(segment => segment !== null)
        })).filter(shot => shot.textSegments.length > 0);
      });
    }
  }, [shots.length, isOnlyWhitespace]);

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
    // This is now handled by updateShotBoundaries
    return;
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

  const addSegmentInfo = useCallback((segmentId: string, info: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, additionalInfo: info }
          : segment
      )
    })));
  }, []);

  const updateSegmentInfo = useCallback((segmentId: string, info: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, additionalInfo: info }
          : segment
      )
    })));
  }, []);

  const removeSegmentInfo = useCallback((segmentId: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, additionalInfo: undefined }
          : segment
      )
    })));
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

  const addCreativeItem = useCallback((type: CreativeItem['type'], content: string, url?: string, file?: File) => {
    const newItem: CreativeItem = {
      id: `creative-${Date.now()}`,
      type,
      content,
      url,
      file,
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
    removeShotInfo,
    addSegmentInfo,
    updateSegmentInfo,
    removeSegmentInfo
  };
};

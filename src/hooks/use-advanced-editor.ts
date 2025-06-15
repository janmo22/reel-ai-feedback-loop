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

  // Initialize content from parent only once on mount or when initial content changes significantly
  useEffect(() => {
    if (initialContent !== content && Math.abs(initialContent.length - content.length) > 1) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Helper function to check if text contains only whitespace
  const isOnlyWhitespace = useCallback((text: string) => {
    return /^\s*$/.test(text);
  }, []);

  // Helper function to find overlapping segments for new selection
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

  // Helper function to adjust shot segments when content changes
  const adjustShotSegments = useCallback((oldContent: string, newContent: string) => {
    if (oldContent === newContent || shots.length === 0) return;

    // Find the position where content changed
    let changeStart = 0;
    let changeEnd = oldContent.length;
    
    // Find start of change
    while (changeStart < Math.min(oldContent.length, newContent.length) && 
           oldContent[changeStart] === newContent[changeStart]) {
      changeStart++;
    }
    
    // Find end of change (working backwards)
    let oldEnd = oldContent.length - 1;
    let newEnd = newContent.length - 1;
    
    while (oldEnd >= changeStart && newEnd >= changeStart && 
           oldContent[oldEnd] === newContent[newEnd]) {
      oldEnd--;
      newEnd--;
    }
    
    changeEnd = oldEnd + 1;
    const lengthDiff = newContent.length - oldContent.length;

    setShots(prevShots => {
      return prevShots.map(shot => ({
        ...shot,
        textSegments: shot.textSegments.map(segment => {
          // If segment is completely before the change, keep as is
          if (segment.endIndex < changeStart) {
            return segment;
          }
          
          // If segment is completely after the change, adjust indices
          if (segment.startIndex > changeEnd) {
            return {
              ...segment,
              startIndex: segment.startIndex + lengthDiff,
              endIndex: segment.endIndex + lengthDiff,
              text: newContent.slice(segment.startIndex + lengthDiff, segment.endIndex + lengthDiff + 1)
            };
          }
          
          // If segment overlaps with change area, expand or adjust it
          let newStart = segment.startIndex;
          let newEnd = segment.endIndex;
          
          // If change is within the segment (typing inside), expand the segment
          if (changeStart >= segment.startIndex && changeStart <= segment.endIndex) {
            newEnd = segment.endIndex + lengthDiff;
          } else if (changeStart < segment.startIndex) {
            // Change is before segment, adjust both start and end
            newStart = segment.startIndex + lengthDiff;
            newEnd = segment.endIndex + lengthDiff;
          }
          
          // Ensure indices are within bounds
          newStart = Math.max(0, Math.min(newStart, newContent.length - 1));
          newEnd = Math.max(newStart, Math.min(newEnd, newContent.length - 1));
          
          const segmentText = newContent.slice(newStart, newEnd + 1);
          
          // Only keep segment if it has meaningful content
          if (isOnlyWhitespace(segmentText)) {
            return null;
          }

          return {
            ...segment,
            startIndex: newStart,
            endIndex: newEnd,
            text: segmentText
          };
        }).filter(segment => segment !== null)
      })).filter(shot => shot.textSegments.length > 0);
    });
  }, [shots, isOnlyWhitespace]);

  // Update content function with improved shot segment handling
  const updateContent = useCallback((newContent: string) => {
    if (newContent === content) return;
    
    const oldContent = content;
    setContent(newContent);
    
    // Adjust shot segments based on content changes
    adjustShotSegments(oldContent, newContent);
  }, [content, adjustShotSegments]);

  const createShot = useCallback((name: string, color: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) return null;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    // Handle overlapping segments more intelligently
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.map(segment => {
            const overlap = overlapping.find(o => o.shot.id === shot.id && o.segment.id === segment.id);
            if (!overlap) return segment;
            
            // Check if the new selection completely covers this segment
            if (start <= segment.startIndex && end >= segment.endIndex) {
              // Remove the entire segment
              return null;
            }
            
            // Check if the new selection is completely within this segment
            if (start > segment.startIndex && end < segment.endIndex) {
              // Split the segment: keep the part before the selection
              return {
                ...segment,
                endIndex: start - 1,
                text: content.slice(segment.startIndex, start)
              };
            }
            
            // Partial overlap: adjust the segment
            if (start <= segment.startIndex && end < segment.endIndex) {
              // Selection starts before or at segment start, ends within segment
              return {
                ...segment,
                startIndex: end + 1,
                text: content.slice(end + 1, segment.endIndex + 1)
              };
            }
            
            if (start > segment.startIndex && end >= segment.endIndex) {
              // Selection starts within segment, ends after or at segment end
              return {
                ...segment,
                endIndex: start - 1,
                text: content.slice(segment.startIndex, start)
              };
            }
            
            return segment;
          }).filter(segment => segment !== null)
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
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments, content]);

  const assignToExistingShot = useCallback((shotId: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) return;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    // Handle overlapping segments more intelligently
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.map(segment => {
            const overlap = overlapping.find(o => o.shot.id === shot.id && o.segment.id === segment.id);
            if (!overlap) return segment;
            
            // Check if the new selection completely covers this segment
            if (start <= segment.startIndex && end >= segment.endIndex) {
              // Remove the entire segment
              return null;
            }
            
            // Check if the new selection is completely within this segment
            if (start > segment.startIndex && end < segment.endIndex) {
              // Split the segment: keep the part before the selection
              return {
                ...segment,
                endIndex: start - 1,
                text: content.slice(segment.startIndex, start)
              };
            }
            
            // Partial overlap: adjust the segment
            if (start <= segment.startIndex && end < segment.endIndex) {
              // Selection starts before or at segment start, ends within segment
              return {
                ...segment,
                startIndex: end + 1,
                text: content.slice(end + 1, segment.endIndex + 1)
              };
            }
            
            if (start > segment.startIndex && end >= segment.endIndex) {
              // Selection starts within segment, ends after or at segment end
              return {
                ...segment,
                endIndex: start - 1,
                text: content.slice(segment.startIndex, start)
              };
            }
            
            return segment;
          }).filter(segment => segment !== null)
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
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments, content]);

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
    addShotInfo,
    updateShotInfo,
    removeShotInfo,
    addSegmentInfo,
    updateSegmentInfo,
    removeSegmentInfo
  };
};

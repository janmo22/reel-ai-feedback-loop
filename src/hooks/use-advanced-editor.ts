
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSharedShots } from './use-shared-shots';
import { useSupabaseAutosave } from './use-supabase-autosave';

export interface ShotInfo {
  id: string;
  label: string;
  value: string;
}

export interface SegmentComment {
  id: string;
  text: string;
  timestamp: number;
}

export interface TextSegment {
  id: string;
  text: string;
  shotId: string;
  startIndex: number;
  endIndex: number;
  isStrikethrough?: boolean;
  comments?: SegmentComment[];
}

export interface Shot {
  id: string;
  name: string;
  color: string;
  textSegments: TextSegment[];
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

export const useAdvancedEditor = (initialContent = '', videoContextId: string = 'default') => {
  const [content, setContent] = useState(initialContent);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [creativeItems, setCreativeItems] = useState<CreativeItem[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use shared shots system
  const { shots, setShots, initializeShots, clearShots } = useSharedShots(videoContextId);
  const { loadAllShots } = useSupabaseAutosave(videoContextId);

  // Load shots from database when video context changes
  useEffect(() => {
    const loadShotsFromDB = async () => {
      if (videoContextId && videoContextId !== 'default') {
        try {
          const savedShots = await loadAllShots();
          if (savedShots && savedShots.length > 0) {
            console.log('Cargando tomas desde DB para video context:', videoContextId, savedShots.length);
            initializeShots(savedShots);
          }
        } catch (error) {
          console.error('Error cargando tomas desde DB:', error);
        }
      }
    };

    loadShotsFromDB();
  }, [videoContextId, loadAllShots, initializeShots]);

  // Autosave functionality with video context
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique localStorage key for this video context
  const getStorageKey = useCallback((suffix: string = '') => {
    return `advancedEditor_${videoContextId}${suffix ? `_${suffix}` : ''}`;
  }, [videoContextId]);

  // Initialize content from parent only once on mount or when initial content changes significantly
  useEffect(() => {
    if (initialContent !== content && Math.abs(initialContent.length - content.length) > 1) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Load saved data for this video context on mount
  useEffect(() => {
    if (videoContextId !== 'default') {
      loadFromLocalStorage();
    }
  }, [videoContextId]);

  // Autosave effect
  useEffect(() => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave (save after 2 seconds of inactivity)
    autosaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);

    // Cleanup timeout on unmount
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [content, shots, creativeItems, videoContextId]);

  // Save to localStorage with video context
  const saveToLocalStorage = useCallback(() => {
    try {
      const editorState = {
        content,
        shots,
        creativeItems,
        timestamp: Date.now()
      };
      localStorage.setItem(getStorageKey('autosave'), JSON.stringify(editorState));
      console.log('Autoguardado local realizado para video context:', videoContextId);
    } catch (error) {
      console.error('Error en autoguardado local:', error);
    }
  }, [content, shots, creativeItems, getStorageKey, videoContextId]);

  // Load from localStorage with video context
  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(getStorageKey('autosave'));
      if (saved) {
        const editorState = JSON.parse(saved);
        setContent(editorState.content || '');
        // Initialize shots if they exist in localStorage and aren't already loaded
        if (editorState.shots && Array.isArray(editorState.shots) && shots.length === 0) {
          initializeShots(editorState.shots);
        }
        setCreativeItems(editorState.creativeItems || []);
        console.log('Autoguardado local cargado para video context:', videoContextId);
        return true;
      }
    } catch (error) {
      console.error('Error cargando autoguardado local:', error);
    }
    return false;
  }, [getStorageKey, videoContextId, shots.length, initializeShots]);

  // Clear autosave for this video context
  const clearAutosave = useCallback(() => {
    localStorage.removeItem(getStorageKey('autosave'));
    console.log('Autoguardado local limpiado para video context:', videoContextId);
  }, [getStorageKey, videoContextId]);

  // Clear editor state (for new videos)
  const clearEditorState = useCallback(() => {
    setContent('');
    clearShots();
    setCreativeItems([]);
    setSelectedText('');
    setSelectionRange(null);
    clearAutosave();
    console.log('Estado del editor limpiado para nuevo video con contexto:', videoContextId);
  }, [clearAutosave, videoContextId, clearShots]);

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
          
          // Check if the change is within the segment (user is typing inside)
          if (changeStart >= segment.startIndex && changeStart <= segment.endIndex + 1) {
            // Expand segment to include new content
            const newEndIndex = Math.max(segment.endIndex + lengthDiff, changeStart + Math.max(0, lengthDiff) - 1);
            const segmentText = newContent.slice(segment.startIndex, newEndIndex + 1);
            
            return {
              ...segment,
              endIndex: newEndIndex,
              text: segmentText
            };
          }
          
          // If segment overlaps with change area but change is not inside, adjust normally
          let newStart = segment.startIndex;
          let newEnd = segment.endIndex;
          
          if (changeStart < segment.startIndex) {
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
  }, [shots, isOnlyWhitespace, setShots]);

  // Update content function with improved shot segment handling
  const updateContent = useCallback((newContent: string) => {
    if (newContent === content) return;
    
    const oldContent = content;
    setContent(newContent);
    
    // Adjust shot segments based on content changes
    adjustShotSegments(oldContent, newContent);
  }, [content, adjustShotSegments]);

  const createShot = useCallback((name: string, color: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) {
      console.warn('No se puede crear toma: texto no válido');
      return null;
    }

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    console.log('🎬 Creando nueva toma:', { name, selectedText, start, end, videoContextId });

    // Handle overlapping segments
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      console.log('Manejando segmentos superpuestos:', overlapping.length);
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.map(segment => {
            const overlap = overlapping.find(o => o.shot.id === shot.id && o.segment.id === segment.id);
            if (!overlap) return segment;
            
            // Handle partial selections within existing segments
            if (start > segment.startIndex && end < segment.endIndex) {
              return segment;
            }
            
            // Check if the new selection completely covers this segment
            if (start <= segment.startIndex && end >= segment.endIndex) {
              return null;
            }
            
            // Partial overlap: adjust the segment
            if (start <= segment.startIndex && end < segment.endIndex) {
              return {
                ...segment,
                startIndex: end + 1,
                text: content.slice(end + 1, segment.endIndex + 1)
              };
            }
            
            if (start > segment.startIndex && end >= segment.endIndex) {
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
      id: `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      textSegments: []
    };

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: selectedText,
      shotId: newShot.id,
      startIndex: start,
      endIndex: end,
      isStrikethrough: false,
      comments: []
    };

    newShot.textSegments.push(newSegment);
    
    console.log('✅ Toma creada exitosamente:', { id: newShot.id, name, segmentCount: newShot.textSegments.length });
    
    // Add to global shots
    setShots(prev => {
      const updated = [...prev, newShot];
      console.log('🔄 Actualizando shots globales:', { antes: prev.length, después: updated.length });
      return updated;
    });
    
    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
    
    return newShot;
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments, content, setShots, videoContextId]);

  const assignToExistingShot = useCallback((shotId: string) => {
    if (!selectedText || !selectionRange || isOnlyWhitespace(selectedText)) return;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    // Handle overlapping segments
    const overlapping = findOverlappingSegments(start, end);
    if (overlapping.length > 0) {
      setShots(prevShots => 
        prevShots.map(shot => ({
          ...shot,
          textSegments: shot.textSegments.map(segment => {
            const overlap = overlapping.find(o => o.shot.id === shot.id && o.segment.id === segment.id);
            if (!overlap) return segment;
            
            // Handle partial selections within existing segments
            if (start > segment.startIndex && end < segment.endIndex) {
              return segment;
            }
            
            // Check if the new selection completely covers this segment
            if (start <= segment.startIndex && end >= segment.endIndex) {
              return null;
            }
            
            // Partial overlap: adjust the segment
            if (start <= segment.startIndex && end < segment.endIndex) {
              return {
                ...segment,
                startIndex: end + 1,
                text: content.slice(end + 1, segment.endIndex + 1)
              };
            }
            
            if (start > segment.startIndex && end >= segment.endIndex) {
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
      isStrikethrough: false,
      comments: []
    };

    setShots(prev => prev.map(shot => 
      shot.id === shotId 
        ? { ...shot, textSegments: [...shot.textSegments, newSegment] }
        : shot
    ));

    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
  }, [selectedText, selectionRange, isOnlyWhitespace, findOverlappingSegments, content, setShots]);

  const toggleTextStrikethrough = useCallback((segmentId: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { ...segment, isStrikethrough: !segment.isStrikethrough }
          : segment
      )
    })));
  }, [setShots]);

  // New functions for handling multiple comments
  const addSegmentComment = useCallback((segmentId: string, commentText: string) => {
    const newComment: SegmentComment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      timestamp: Date.now()
    };

    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? { 
              ...segment, 
              comments: [...(segment.comments || []), newComment]
            }
          : segment
      )
    })));
  }, [setShots]);

  const updateSegmentComment = useCallback((segmentId: string, commentId: string, commentText: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? {
              ...segment,
              comments: segment.comments?.map(comment =>
                comment.id === commentId 
                  ? { ...comment, text: commentText }
                  : comment
              ) || []
            }
          : segment
      )
    })));
  }, [setShots]);

  const removeSegmentComment = useCallback((segmentId: string, commentId: string) => {
    setShots(prev => prev.map(shot => ({
      ...shot,
      textSegments: shot.textSegments.map(segment =>
        segment.id === segmentId
          ? {
              ...segment,
              comments: segment.comments?.filter(comment => comment.id !== commentId) || []
            }
          : segment
      )
    })));
  }, [setShots]);

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

  // Add the missing getShotsBySection function
  const getShotsBySection = useCallback((sectionId: string): Shot[] => {
    // Return all shots since they are now shared globally across all sections
    return shots;
  }, [shots]);

  // Add the missing getAllShots function
  const getAllShots = useCallback((): Shot[] => {
    return shots;
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
    getShotsBySection,
    getAllShots,
    toggleTextStrikethrough,
    addSegmentComment,
    updateSegmentComment,
    removeSegmentComment,
    // Autosave functions
    saveToLocalStorage,
    loadFromLocalStorage,
    clearAutosave,
    clearEditorState
  };
};

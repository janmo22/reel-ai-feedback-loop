
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
  recorded?: boolean;
}

export interface Inspiration {
  id: string;
  url?: string;
  title: string;
  notes: string;
  timestamp?: string;
  imageUrl?: string;
  imageFile?: File;
  type: 'video' | 'image' | 'note';
}

export interface ScriptSection {
  id: string;
  type: 'hook' | 'buildup' | 'value' | 'cta';
  content: string;
  segments: TextSegment[];
  collapsed: boolean;
}

export const SECTION_TYPES = {
  hook: {
    label: 'Hook (Ruptura de patrón)',
    description: 'Invita al usuario a quedarse en el video con una ruptura de patrón',
    placeholder: 'Ejemplo: "Si haces esto, nunca más tendrás problemas con..."'
  },
  buildup: {
    label: 'Build-up',
    description: 'Explica el problema que soluciona tu video',
    placeholder: 'Explica el problema o situación que vas a resolver...'
  },
  value: {
    label: 'Aporte de valor',
    description: 'Aquí vas con todo, explicas la solución',
    placeholder: 'Comparte tu conocimiento y la solución al problema...'
  },
  cta: {
    label: 'Call to action',
    description: 'Llamada a la acción que aporte valor',
    placeholder: 'Invita a tu audiencia a actuar: seguirte, comentar, etc...'
  }
};

export const useTextEditor = () => {
  const [sections, setSections] = useState<ScriptSection[]>([
    { id: 'hook', type: 'hook', content: '', segments: [], collapsed: false },
    { id: 'buildup', type: 'buildup', content: '', segments: [], collapsed: false },
    { id: 'value', type: 'value', content: '', segments: [], collapsed: false },
    { id: 'cta', type: 'cta', content: '', segments: [], collapsed: false }
  ]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [selectedText, setSelectedText] = useState<{ text: string; range: Range | null; sectionId: string | null }>({ 
    text: '', 
    range: null, 
    sectionId: null 
  });
  const [showShotMenu, setShowShotMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const addSegmentInfo = useCallback((sectionId: string, segmentId: string, info: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            segments: section.segments.map(segment => 
              segment.id === segmentId ? { ...segment, information: info } : segment
            )
          }
        : section
    ));
  }, []);

  const removeSegment = useCallback((sectionId: string, segmentId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            segments: section.segments.filter(segment => segment.id !== segmentId)
          }
        : section
    ));
  }, []);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, collapsed: !section.collapsed }
        : section
    ));
  }, []);

  const handleTextSelection = useCallback((sectionId: string) => {
    const selection = window.getSelection();
    const editorRef = editorRefs.current[sectionId];
    
    if (selection && selection.toString().trim() && editorRef?.contains(selection.anchorNode)) {
      const text = selection.toString();
      const range = selection.getRangeAt(0);
      
      setSelectedText({ text, range, sectionId });
      
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
      description,
      recorded: false
    };
    setShots(prev => [...prev, newShot]);
    return newShot;
  }, []);

  const toggleShotRecorded = useCallback((shotId: string) => {
    setShots(prev => prev.map(shot => 
      shot.id === shotId ? { ...shot, recorded: !shot.recorded } : shot
    ));
  }, []);

  // Función mejorada para buscar el texto exacto en el contenido incluyendo saltos de línea
  const findTextInContent = useCallback((content: string, searchText: string, startFrom = 0): { start: number; end: number } | null => {
    // Normalizar espacios en blanco y saltos de línea para la búsqueda
    const normalizedContent = content.slice(startFrom);
    const normalizedSearch = searchText.trim();
    
    if (!normalizedSearch) return null;
    
    // Buscar el texto exacto
    const index = normalizedContent.indexOf(normalizedSearch);
    if (index !== -1) {
      return {
        start: startFrom + index,
        end: startFrom + index + normalizedSearch.length
      };
    }
    
    // Si no se encuentra exacto, buscar por palabras
    const words = normalizedSearch.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return null;
    
    let searchIndex = 0;
    let foundStart = -1;
    let foundEnd = -1;
    
    for (let i = 0; i < words.length; i++) {
      const wordIndex = normalizedContent.indexOf(words[i], searchIndex);
      if (wordIndex === -1) return null;
      
      if (i === 0) {
        foundStart = startFrom + wordIndex;
      }
      if (i === words.length - 1) {
        foundEnd = startFrom + wordIndex + words[i].length;
      }
      
      searchIndex = wordIndex + words[i].length;
    }
    
    return foundStart !== -1 && foundEnd !== -1 ? { start: foundStart, end: foundEnd } : null;
  }, []);

  // Función mejorada para actualizar segmentos cuando cambia el contenido
  const updateSegmentsAfterContentChange = useCallback((sectionId: string, newContent: string, oldContent: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;

      // Si no hay contenido nuevo, limpiar todos los segmentos
      if (!newContent.trim()) {
        return { ...section, segments: [] };
      }

      const updatedSegments = section.segments.map(segment => {
        // Buscar el texto del segmento en el nuevo contenido
        const found = findTextInContent(newContent, segment.text);
        
        if (found) {
          return {
            ...segment,
            startIndex: found.start,
            endIndex: found.end,
            text: newContent.slice(found.start, found.end)
          };
        }

        // Si no se encuentra, intentar con una búsqueda más flexible
        const words = segment.text.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
          const firstWord = words[0];
          const lastWord = words[words.length - 1];
          
          const firstIndex = newContent.indexOf(firstWord);
          const lastIndex = newContent.lastIndexOf(lastWord);
          
          if (firstIndex !== -1 && lastIndex !== -1 && lastIndex >= firstIndex) {
            const newStartIndex = firstIndex;
            const newEndIndex = lastIndex + lastWord.length;
            const newText = newContent.slice(newStartIndex, newEndIndex);
            
            return {
              ...segment,
              text: newText,
              startIndex: newStartIndex,
              endIndex: newEndIndex
            };
          }
        }

        // Si no se puede recuperar, marcar para eliminación
        return null;
      }).filter((segment): segment is TextSegment => segment !== null);

      return {
        ...section,
        segments: updatedSegments
      };
    }));
  }, [findTextInContent]);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    const oldContent = sections.find(s => s.id === sectionId)?.content || '';
    
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
    
    // Actualizar segmentos después del cambio de contenido
    updateSegmentsAfterContentChange(sectionId, content, oldContent);
  }, [sections, updateSegmentsAfterContentChange]);

  // Verificar si hay overlap con segmentos existentes
  const hasOverlap = useCallback((sectionId: string, startIndex: number, endIndex: number, excludeSegmentId?: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;

    return section.segments.some(segment => 
      segment.id !== excludeSegmentId && 
      !(endIndex <= segment.startIndex || startIndex >= segment.endIndex)
    );
  }, [sections]);

  // Remover segmentos que se superponen con el nuevo texto seleccionado
  const removeOverlappingSegments = useCallback((sectionId: string, startIndex: number, endIndex: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            segments: section.segments.filter(segment => 
              endIndex <= segment.startIndex || startIndex >= segment.endIndex
            )
          }
        : section
    ));
  }, []);

  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text || !selectedText.sectionId) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const section = sections.find(s => s.id === selectedText.sectionId);
    if (!section) return;

    // Buscar el texto seleccionado en el contenido usando la función mejorada
    const found = findTextInContent(section.content, selectedText.text);
    
    if (!found) return;

    // Remover segmentos que se superponen antes de crear el nuevo
    removeOverlappingSegments(selectedText.sectionId, found.start, found.end);

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex: found.start,
      endIndex: found.end
    };

    setSections(prev => prev.map(section => 
      section.id === selectedText.sectionId 
        ? { ...section, segments: [...section.segments, newSegment] }
        : section
    ));

    setShowShotMenu(false);
    setSelectedText({ text: '', range: null, sectionId: null });
  }, [selectedText, shots, sections, removeOverlappingSegments, findTextInContent]);

  const applySegmentStyling = useCallback((sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    const section = sections.find(s => s.id === sectionId);
    
    if (!editor || !section) return;

    if (section.segments.length > 0) {
      editor.classList.add('has-segments');
    } else {
      editor.classList.remove('has-segments');
    }
  }, [sections]);

  const addInspiration = useCallback((inspiration: Omit<Inspiration, 'id'>) => {
    const newInspiration: Inspiration = {
      id: `inspiration-${Date.now()}`,
      ...inspiration
    };
    setInspirations(prev => [...prev, newInspiration]);
  }, []);

  const updateSegmentInfo = useCallback((sectionId: string, segmentId: string, information: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            segments: section.segments.map(segment => 
              segment.id === segmentId ? { ...segment, information } : segment
            )
          }
        : section
    ));
  }, []);

  const getAllContent = useCallback(() => {
    return sections.map(section => section.content).join('\n\n');
  }, [sections]);

  const getAllSegments = useCallback(() => {
    return sections.flatMap(section => 
      section.segments.map(segment => ({ ...segment, sectionId: section.id }))
    );
  }, [sections]);

  return {
    sections,
    shots,
    inspirations,
    selectedText,
    showShotMenu,
    menuPosition,
    editorRefs,
    handleTextSelection,
    addShot,
    assignShotToText,
    addInspiration,
    updateSegmentInfo,
    addSegmentInfo,
    removeSegment,
    updateSectionContent,
    setShowShotMenu,
    applySegmentStyling,
    getAllContent,
    getAllSegments,
    toggleSectionCollapse,
    toggleShotRecorded
  };
};

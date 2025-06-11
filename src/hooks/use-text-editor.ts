
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
  const [selectedText, setSelectedText] = useState<{ 
    text: string; 
    range: Range | null; 
    sectionId: string | null;
    startIndex?: number;
    endIndex?: number;
  }>({ 
    text: '', 
    range: null, 
    sectionId: null,
    startIndex: undefined,
    endIndex: undefined
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

  // Función mejorada para obtener la posición exacta del cursor en el texto plano
  const getTextPosition = useCallback((sectionId: string, range: Range): { start: number; end: number } | null => {
    const editor = editorRefs.current[sectionId];
    if (!editor || !range) return null;

    const textContent = editor.textContent || '';
    
    try {
      // Crear un range temporal para obtener la posición del inicio
      const startRange = document.createRange();
      startRange.setStart(editor, 0);
      startRange.setEnd(range.startContainer, range.startOffset);
      const startText = startRange.toString();
      
      // Crear un range temporal para obtener la posición del final
      const endRange = document.createRange();
      endRange.setStart(editor, 0);
      endRange.setEnd(range.endContainer, range.endOffset);
      const endText = endRange.toString();

      return {
        start: startText.length,
        end: endText.length
      };
    } catch (error) {
      console.log('Error getting text position:', error);
      return null;
    }
  }, []);

  // Función mejorada para manejar la selección de texto
  const handleTextSelection = useCallback((sectionId: string) => {
    const selection = window.getSelection();
    const editorRef = editorRefs.current[sectionId];
    
    if (!selection || !editorRef) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setShowShotMenu(false);
      return;
    }

    if (!selection.rangeCount || !editorRef.contains(selection.anchorNode)) {
      setShowShotMenu(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const position = getTextPosition(sectionId, range);
    if (!position) return;

    setSelectedText({ 
      text: selectedText, 
      range, 
      sectionId,
      startIndex: position.start,
      endIndex: position.end
    });
    
    // Posicionar el menú
    const rect = range.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowShotMenu(true);
  }, [getTextPosition]);

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

  // Función para validar si un segmento sigue siendo válido en el contenido actual
  const isSegmentValid = useCallback((segment: TextSegment, content: string): boolean => {
    if (!content || !segment.text) return false;
    
    // Verificar que las posiciones sean válidas
    if (segment.startIndex < 0 || segment.endIndex > content.length) return false;
    
    // Verificar que el texto en esa posición coincida
    const currentText = content.substring(segment.startIndex, segment.endIndex);
    return currentText === segment.text;
  }, []);

  // Función para actualizar las posiciones de los segmentos después de cambios de texto
  const updateSegmentPositions = useCallback((sectionId: string, newContent: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;

      // Si no hay contenido, eliminar todos los segmentos
      if (!newContent.trim()) {
        return { ...section, content: newContent, segments: [] };
      }

      // Filtrar y actualizar segmentos válidos
      const validSegments = section.segments.filter(segment => {
        // Buscar el texto del segmento en el nuevo contenido
        const segmentIndex = newContent.indexOf(segment.text);
        
        if (segmentIndex !== -1) {
          // Actualizar posiciones
          segment.startIndex = segmentIndex;
          segment.endIndex = segmentIndex + segment.text.length;
          return true;
        }
        
        return false;
      });

      return {
        ...section,
        content: newContent,
        segments: validSegments
      };
    }));
  }, []);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    // Usar setTimeout para evitar conflictos con el DOM
    setTimeout(() => {
      updateSegmentPositions(sectionId, content);
    }, 0);
  }, [updateSegmentPositions]);

  // Función mejorada para asignar toma al texto
  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text || !selectedText.sectionId) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const startIndex = selectedText.startIndex ?? 0;
    const endIndex = selectedText.endIndex ?? selectedText.text.length;

    // Crear nuevo segmento
    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex,
      endIndex
    };

    setSections(prev => prev.map(section => {
      if (section.id !== selectedText.sectionId) return section;
      
      // Remover segmentos que se superponen
      const nonOverlappingSegments = section.segments.filter(segment => 
        endIndex <= segment.startIndex || startIndex >= segment.endIndex
      );
      
      return {
        ...section,
        segments: [...nonOverlappingSegments, newSegment]
      };
    }));

    setShowShotMenu(false);
    setSelectedText({ text: '', range: null, sectionId: null, startIndex: undefined, endIndex: undefined });
  }, [selectedText, shots]);

  const applySegmentStyling = useCallback((sectionId: string) => {
    // Esta función ya no es necesaria con el nuevo sistema
  }, []);

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

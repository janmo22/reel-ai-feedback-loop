
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

  const getTextPositionInEditor = useCallback((editorElement: HTMLElement, node: Node, offset: number): number => {
    let position = 0;
    let currentNode = editorElement.firstChild;
    let found = false;

    const walkNodes = (n: Node | null) => {
      if (!n || found) return;

      if (n === node) {
        position += offset;
        found = true;
        return;
      }

      if (n.nodeType === Node.TEXT_NODE) {
        position += n.textContent?.length || 0;
      } else if (n.nodeName === 'BR') {
        position += 1; // Contar salto de línea
      }

      if (n.firstChild) {
        walkNodes(n.firstChild);
      }

      if (!found && n.nextSibling) {
        walkNodes(n.nextSibling);
      }
    };

    walkNodes(currentNode);
    return position;
  }, []);

  const handleTextSelection = useCallback((sectionId: string) => {
    const selection = window.getSelection();
    const editorRef = editorRefs.current[sectionId];
    
    if (selection && selection.toString().trim() && editorRef?.contains(selection.anchorNode)) {
      const text = selection.toString();
      const range = selection.getRangeAt(0);
      
      // Calcular las posiciones absolutas en el texto plano
      const startPos = getTextPositionInEditor(editorRef, range.startContainer, range.startOffset);
      const endPos = getTextPositionInEditor(editorRef, range.endContainer, range.endOffset);
      
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
  }, [getTextPositionInEditor]);

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

  const calculateTextPosition = useCallback((element: HTMLElement): { start: number, end: number } => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preCaretRange.toString().length;
    const end = start + range.toString().length;
    
    return { start, end };
  }, []);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setSections(prev => prev.map(section => {
      if (section.id !== sectionId) return section;

      // Actualizar contenido
      const updatedSection = { ...section, content };

      // Si no hay contenido, limpiar segmentos
      if (!content.trim()) {
        return { ...updatedSection, segments: [] };
      }

      // Actualizar las posiciones de los segmentos existentes
      const updatedSegments: TextSegment[] = [];
      
      section.segments.forEach(segment => {
        // Buscar el texto del segmento en el nuevo contenido
        const segmentText = segment.text;
        let searchStart = 0;
        let found = false;

        // Intentar encontrar el texto cerca de su posición original
        const searchRange = 50; // Buscar dentro de 50 caracteres de la posición original
        const minStart = Math.max(0, segment.startIndex - searchRange);
        const maxStart = Math.min(content.length, segment.startIndex + searchRange);

        for (let i = minStart; i <= maxStart && !found; i++) {
          const possibleMatch = content.substr(i, segmentText.length);
          if (possibleMatch === segmentText) {
            updatedSegments.push({
              ...segment,
              startIndex: i,
              endIndex: i + segmentText.length
            });
            found = true;
          }
        }

        // Si no se encontró cerca, buscar en todo el contenido
        if (!found) {
          const index = content.indexOf(segmentText);
          if (index !== -1) {
            updatedSegments.push({
              ...segment,
              startIndex: index,
              endIndex: index + segmentText.length
            });
          }
        }
      });

      return { ...updatedSection, segments: updatedSegments };
    }));
  }, []);

  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text || !selectedText.sectionId) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const section = sections.find(s => s.id === selectedText.sectionId);
    if (!section || !editorRefs.current[selectedText.sectionId]) return;

    const editorElement = editorRefs.current[selectedText.sectionId]!;
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Calcular las posiciones en el texto plano
    const startPos = getTextPositionInEditor(editorElement, range.startContainer, range.startOffset);
    const endPos = getTextPositionInEditor(editorElement, range.endContainer, range.endOffset);

    // Verificar y remover segmentos superpuestos
    const filteredSegments = section.segments.filter(segment => 
      segment.endIndex <= startPos || segment.startIndex >= endPos
    );

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex: startPos,
      endIndex: endPos
    };

    setSections(prev => prev.map(s => 
      s.id === selectedText.sectionId 
        ? { ...s, segments: [...filteredSegments, newSegment] }
        : s
    ));

    setShowShotMenu(false);
    setSelectedText({ text: '', range: null, sectionId: null });
  }, [selectedText, shots, sections, getTextPositionInEditor]);

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
    getAllContent,
    getAllSegments,
    toggleSectionCollapse,
    toggleShotRecorded
  };
};


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
  url?: string;
  title: string;
  notes: string;
  timestamp?: string;
  imageUrl?: string;
  imageFile?: File;
}

export interface ScriptSection {
  id: string;
  type: 'hook' | 'buildup' | 'value' | 'cta';
  content: string;
  segments: TextSegment[];
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
    { id: 'hook', type: 'hook', content: '', segments: [] },
    { id: 'buildup', type: 'buildup', content: '', segments: [] },
    { id: 'value', type: 'value', content: '', segments: [] },
    { id: 'cta', type: 'cta', content: '', segments: [] }
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
      description
    };
    setShots(prev => [...prev, newShot]);
    return newShot;
  }, []);

  const assignShotToText = useCallback((shotId: string) => {
    if (!selectedText.range || !selectedText.text || !selectedText.sectionId) return;
    
    const shot = shots.find(s => s.id === shotId);
    if (!shot) return;

    const section = sections.find(s => s.id === selectedText.sectionId);
    if (!section) return;

    const startIndex = section.content.indexOf(selectedText.text);
    const endIndex = startIndex + selectedText.text.length;

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText.text,
      shotId,
      color: shot.color,
      startIndex,
      endIndex
    };

    setSections(prev => prev.map(section => 
      section.id === selectedText.sectionId 
        ? { ...section, segments: [...section.segments, newSegment] }
        : section
    ));

    setShowShotMenu(false);
    setSelectedText({ text: '', range: null, sectionId: null });

    // Apply styling after state update
    setTimeout(() => applySegmentStyling(selectedText.sectionId), 0);
  }, [selectedText, shots, sections]);

  const applySegmentStyling = useCallback((sectionId: string) => {
    const editor = editorRefs.current[sectionId];
    const section = sections.find(s => s.id === sectionId);
    
    if (!editor || !section || section.segments.length === 0) return;

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
    section.segments.forEach(segment => {
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
          span.style.backgroundColor = shot.color;
          span.style.color = 'white';
          span.style.fontWeight = '600';
          span.style.borderRadius = '4px';
          span.style.padding = '2px 6px';
          span.style.margin = '0 1px';
          span.style.display = 'inline-block';
          
          // Add indicator for segments with information
          if (segment.information) {
            span.style.borderBottom = `2px solid rgba(255,255,255,0.8)`;
            span.title = 'Este segmento tiene información adicional';
          }
          
          try {
            range.surroundContents(span);
          } catch (e) {
            span.textContent = segment.text;
            range.deleteContents();
            range.insertNode(span);
          }
          
          break;
        }
      }
    });
  }, [sections, shots]);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
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
    
    // Reapply styling to show the information indicator
    setTimeout(() => applySegmentStyling(sectionId), 0);
  }, [applySegmentStyling]);

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
    updateSectionContent,
    setShowShotMenu,
    applySegmentStyling,
    getAllContent,
    getAllSegments
  };
};

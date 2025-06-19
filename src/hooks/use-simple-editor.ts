
import { useState, useCallback } from 'react';

export interface Shot {
  id: string;
  name: string;
  color: string;
}

export interface Section {
  id: string;
  type: 'hook' | 'buildup' | 'value' | 'cta';
  title: string;
  description: string;
  placeholder: string;
  content: string;
}

export const SECTIONS = [
  {
    id: 'hook',
    type: 'hook' as const,
    title: 'Hook (Ruptura de patrón)',
    description: 'Invita al usuario a quedarse en el video con una ruptura de patrón',
    placeholder: 'Ejemplo: "Si haces esto, nunca más tendrás problemas con..."'
  },
  {
    id: 'buildup',
    type: 'buildup' as const,
    title: 'Build-up',
    description: 'Explica el problema que soluciona tu video',
    placeholder: 'Explica el problema o situación que vas a resolver...'
  },
  {
    id: 'value',
    type: 'value' as const,
    title: 'Aporte de valor',
    description: 'Aquí vas con todo, explicas la solución',
    placeholder: 'Comparte tu conocimiento y la solución al problema...'
  },
  {
    id: 'cta',
    type: 'cta' as const,
    title: 'Call to action',
    description: 'Llamada a la acción que aporte valor',
    placeholder: 'Invita a tu audiencia a actuar: seguirte, comentar, etc...'
  }
];

export const useSimpleEditor = () => {
  const [sections, setSections] = useState<Section[]>(
    SECTIONS.map(s => ({ ...s, content: '' }))
  );
  const [shots, setShots] = useState<Shot[]>([]);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
  }, []);

  const loadInitialContent = useCallback((initialData: any) => {
    setSections(prev => prev.map(section => {
      let content = '';
      switch(section.id) {
        case 'hook':
          content = initialData.hook || '';
          break;
        case 'buildup':
          content = initialData.build_up || '';
          break;
        case 'value':
          content = initialData.value_add || '';
          break;
        case 'cta':
          content = initialData.call_to_action || '';
          break;
      }
      return { ...section, content };
    }));
  }, []);

  const addShot = useCallback((name: string, color: string) => {
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      name,
      color
    };
    setShots(prev => [...prev, newShot]);
    return newShot;
  }, []);

  const getAllContent = useCallback(() => {
    return sections.map(section => section.content).join('\n\n');
  }, [sections]);

  return {
    sections,
    shots,
    updateSectionContent,
    loadInitialContent,
    addShot,
    getAllContent
  };
};

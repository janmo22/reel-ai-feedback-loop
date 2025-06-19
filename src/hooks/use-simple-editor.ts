
import { useState, useCallback, useMemo } from 'react';

interface Section {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  content: string;
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'hook',
    title: 'Hook',
    description: 'Gancho inicial para captar la atención en los primeros segundos',
    placeholder: 'Escribe un gancho que capture inmediatamente la atención de tu audiencia...',
    content: ''
  },
  {
    id: 'build-up',
    title: 'Desarrollo',
    description: 'Desarrollo del contenido principal y construcción del valor',
    placeholder: 'Desarrolla tu contenido principal, aporta valor y mantén el interés...',
    content: ''
  },
  {
    id: 'value-add',
    title: 'Valor Añadido',
    description: 'Información valiosa, tips o conocimientos únicos',
    placeholder: 'Comparte conocimientos valiosos, tips únicos o información útil...',
    content: ''
  },
  {
    id: 'call-to-action',
    title: 'Call to Action',
    description: 'Llamada a la acción para involucrar a la audiencia',
    placeholder: 'Invita a tu audiencia a interactuar: comentar, seguir, compartir...',
    content: ''
  }
];

export const useSimpleEditor = () => {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);

  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content }
        : section
    ));
  }, []);

  const getAllContent = useCallback(() => {
    return sections
      .filter(section => section.content.trim().length > 0)
      .map(section => `${section.title}:\n${section.content}`)
      .join('\n\n');
  }, [sections]);

  const clearAllContent = useCallback(() => {
    setSections(DEFAULT_SECTIONS.map(section => ({ ...section, content: '' })));
  }, []);

  const getSectionContent = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.content || '';
  }, [sections]);

  const hasContent = useMemo(() => {
    return sections.some(section => section.content.trim().length > 0);
  }, [sections]);

  return {
    sections,
    updateSectionContent,
    getAllContent,
    clearAllContent,
    getSectionContent,
    hasContent
  };
};

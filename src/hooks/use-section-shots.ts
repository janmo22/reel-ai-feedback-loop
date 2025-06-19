
import { useState, useCallback, useEffect } from 'react';
import { Shot } from './use-advanced-editor';
import { useSharedShots } from './use-shared-shots';

export const useSectionShots = (sectionId: string, videoContextId: string = 'default') => {
  const [localShots, setLocalShots] = useState<Shot[]>([]);
  const { setShots: setGlobalShots } = useSharedShots(videoContextId);

  // Add shot to this section and to global shots
  const addShotToSection = useCallback((shot: Shot) => {
    console.log('Añadiendo toma a la sección:', sectionId, shot.name);
    
    // Add to local section shots
    setLocalShots(prev => {
      const exists = prev.find(s => s.id === shot.id);
      if (exists) return prev;
      return [...prev, shot];
    });

    // Add to global shots (for final summary)
    setGlobalShots(prev => {
      const exists = prev.find(s => s.id === shot.id);
      if (exists) return prev;
      return [...prev, shot];
    });
  }, [sectionId, setGlobalShots]);

  // Remove shot from this section only
  const removeShotFromSection = useCallback((shotId: string) => {
    console.log('Removiendo toma de la sección:', sectionId, shotId);
    setLocalShots(prev => prev.filter(shot => shot.id !== shotId));
  }, [sectionId]);

  // Update shot in both local and global
  const updateShot = useCallback((shotId: string, updates: Partial<Shot>) => {
    setLocalShots(prev => prev.map(shot => 
      shot.id === shotId ? { ...shot, ...updates } : shot
    ));

    setGlobalShots(prev => prev.map(shot => 
      shot.id === shotId ? { ...shot, ...updates } : shot
    ));
  }, [setGlobalShots]);

  // Clear all shots from this section
  const clearSectionShots = useCallback(() => {
    console.log('Limpiando tomas de la sección:', sectionId);
    setLocalShots([]);
  }, [sectionId]);

  return {
    shots: localShots,
    addShotToSection,
    removeShotFromSection,
    updateShot,
    clearSectionShots
  };
};

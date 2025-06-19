
import { useState, useCallback, useEffect } from 'react';
import { Shot } from './use-advanced-editor';

// Global storage for all shots across all video contexts
const globalShotsRepository: { [videoContextId: string]: Shot[] } = {};

// Storage for section-specific shot assignments
const sectionShotsStorage: { [videoContextId: string]: { [sectionId: string]: string[] } } = {};

// Listeners for section-specific updates
const sectionShotsListeners: { [videoContextId: string]: { [sectionId: string]: Set<() => void> } } = {};

export const useSectionShots = (videoContextId: string = 'default', sectionId: string = 'default') => {
  // Initialize storage if it doesn't exist
  if (!globalShotsRepository[videoContextId]) {
    globalShotsRepository[videoContextId] = [];
  }
  if (!sectionShotsStorage[videoContextId]) {
    sectionShotsStorage[videoContextId] = {};
  }
  if (!sectionShotsStorage[videoContextId][sectionId]) {
    sectionShotsStorage[videoContextId][sectionId] = [];
  }
  if (!sectionShotsListeners[videoContextId]) {
    sectionShotsListeners[videoContextId] = {};
  }
  if (!sectionShotsListeners[videoContextId][sectionId]) {
    sectionShotsListeners[videoContextId][sectionId] = new Set();
  }

  // Get shots for this specific section
  const getSectionShots = useCallback(() => {
    const sectionShotIds = sectionShotsStorage[videoContextId][sectionId] || [];
    const allShots = globalShotsRepository[videoContextId] || [];
    return allShots.filter(shot => sectionShotIds.includes(shot.id));
  }, [videoContextId, sectionId]);

  const [shots, setShotsLocal] = useState<Shot[]>(() => getSectionShots());

  // Register this component as a listener for this specific section
  useEffect(() => {
    const updateShots = () => {
      const newShots = getSectionShots();
      setShotsLocal(newShots);
    };

    sectionShotsListeners[videoContextId][sectionId].add(updateShots);

    // Sync with current state
    updateShots();

    return () => {
      sectionShotsListeners[videoContextId][sectionId].delete(updateShots);
    };
  }, [videoContextId, sectionId, getSectionShots]);

  // Add a shot to the global repository and assign it to this section
  const addShotToSection = useCallback((shot: Shot) => {
    // Add to global repository if it doesn't exist
    const existingGlobalShot = globalShotsRepository[videoContextId].find(s => s.id === shot.id);
    if (!existingGlobalShot) {
      globalShotsRepository[videoContextId].push(shot);
    } else {
      // Update existing shot
      const index = globalShotsRepository[videoContextId].findIndex(s => s.id === shot.id);
      globalShotsRepository[videoContextId][index] = shot;
    }

    // Add to this section if not already assigned
    if (!sectionShotsStorage[videoContextId][sectionId].includes(shot.id)) {
      sectionShotsStorage[videoContextId][sectionId].push(shot.id);
    }

    // Notify all listeners of this section
    sectionShotsListeners[videoContextId][sectionId].forEach(listener => {
      listener();
    });

    console.log('Toma añadida a sección:', {
      shotId: shot.id,
      shotName: shot.name,
      sectionId,
      videoContextId
    });
  }, [videoContextId, sectionId]);

  // Update an existing shot in the global repository
  const updateShotInSection = useCallback((shotId: string, updatedShot: Shot) => {
    const shotIndex = globalShotsRepository[videoContextId].findIndex(s => s.id === shotId);
    if (shotIndex !== -1) {
      globalShotsRepository[videoContextId][shotIndex] = updatedShot;
      
      // Notify all sections that might have this shot
      Object.keys(sectionShotsListeners[videoContextId]).forEach(secId => {
        if (sectionShotsStorage[videoContextId][secId]?.includes(shotId)) {
          sectionShotsListeners[videoContextId][secId].forEach(listener => {
            listener();
          });
        }
      });
    }
  }, [videoContextId]);

  // Remove a shot from this section (but keep it in global repository)
  const removeShotFromSection = useCallback((shotId: string) => {
    const index = sectionShotsStorage[videoContextId][sectionId].indexOf(shotId);
    if (index !== -1) {
      sectionShotsStorage[videoContextId][sectionId].splice(index, 1);
      
      // Notify listeners of this section
      sectionShotsListeners[videoContextId][sectionId].forEach(listener => {
        listener();
      });
    }
  }, [videoContextId, sectionId]);

  // Get all available shots (for selection purposes)
  const getAllAvailableShots = useCallback(() => {
    return globalShotsRepository[videoContextId] || [];
  }, [videoContextId]);

  // Assign an existing shot to this section
  const assignExistingShotToSection = useCallback((shotId: string) => {
    if (!sectionShotsStorage[videoContextId][sectionId].includes(shotId)) {
      sectionShotsStorage[videoContextId][sectionId].push(shotId);
      
      // Notify listeners of this section
      sectionShotsListeners[videoContextId][sectionId].forEach(listener => {
        listener();
      });
    }
  }, [videoContextId, sectionId]);

  // Clear all shots from this section
  const clearSectionShots = useCallback(() => {
    sectionShotsStorage[videoContextId][sectionId] = [];
    
    // Notify listeners of this section
    sectionShotsListeners[videoContextId][sectionId].forEach(listener => {
      listener();
    });
  }, [videoContextId, sectionId]);

  return {
    shots, // Only shots for this specific section
    addShotToSection,
    updateShotInSection,
    removeShotFromSection,
    getAllAvailableShots,
    assignExistingShotToSection,
    clearSectionShots
  };
};

// Hook to get all shots across all sections (for summary)
export const useAllVideoShots = (videoContextId: string = 'default') => {
  const [allShots, setAllShots] = useState<Shot[]>(() => 
    globalShotsRepository[videoContextId] || []
  );

  useEffect(() => {
    // This is a simple approach - in a more complex scenario, you might want 
    // to set up listeners for global changes
    const interval = setInterval(() => {
      const currentShots = globalShotsRepository[videoContextId] || [];
      setAllShots(currentShots);
    }, 1000);

    return () => clearInterval(interval);
  }, [videoContextId]);

  const getShotUsageBySection = useCallback(() => {
    const usage: { [shotId: string]: string[] } = {};
    const sectionData = sectionShotsStorage[videoContextId] || {};
    
    Object.entries(sectionData).forEach(([sectionId, shotIds]) => {
      shotIds.forEach(shotId => {
        if (!usage[shotId]) {
          usage[shotId] = [];
        }
        usage[shotId].push(sectionId);
      });
    });
    
    return usage;
  }, [videoContextId]);

  return {
    allShots,
    getShotUsageBySection
  };
};

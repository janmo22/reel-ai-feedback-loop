
import { useState, useCallback, useEffect } from 'react';
import { Shot } from './use-advanced-editor';

// Global storage for shots per video context
const globalShotsStorage: { [videoContextId: string]: Shot[] } = {};
const shotsListeners: { [videoContextId: string]: Set<(shots: Shot[]) => void> } = {};

export const useSharedShots = (videoContextId: string = 'default') => {
  const [shots, setShotsLocal] = useState<Shot[]>(() => 
    globalShotsStorage[videoContextId] || []
  );

  // Initialize listeners set for this video context
  useEffect(() => {
    if (!shotsListeners[videoContextId]) {
      shotsListeners[videoContextId] = new Set();
    }
  }, [videoContextId]);

  // Register this component as a listener
  useEffect(() => {
    const updateShots = (newShots: Shot[]) => {
      setShotsLocal(newShots);
    };

    shotsListeners[videoContextId]?.add(updateShots);

    return () => {
      shotsListeners[videoContextId]?.delete(updateShots);
    };
  }, [videoContextId]);

  // Function to update shots globally
  const setShots = useCallback((newShots: Shot[] | ((prev: Shot[]) => Shot[])) => {
    const updatedShots = typeof newShots === 'function' 
      ? newShots(globalShotsStorage[videoContextId] || [])
      : newShots;
    
    // Update global storage
    globalShotsStorage[videoContextId] = updatedShots;
    
    // Notify all listeners in this video context
    shotsListeners[videoContextId]?.forEach(listener => {
      listener(updatedShots);
    });

    console.log('Tomas actualizadas globalmente:', {
      videoContextId,
      shotsCount: updatedShots.length,
      listenersCount: shotsListeners[videoContextId]?.size || 0
    });
  }, [videoContextId]);

  // Initialize shots from external source
  const initializeShots = useCallback((initialShots: Shot[]) => {
    if (!globalShotsStorage[videoContextId] || globalShotsStorage[videoContextId].length === 0) {
      console.log('Inicializando tomas para video context:', videoContextId, 'con', initialShots.length, 'tomas');
      setShots(initialShots);
    }
  }, [videoContextId, setShots]);

  // Clear shots for this video context
  const clearShots = useCallback(() => {
    console.log('Limpiando tomas para video context:', videoContextId);
    delete globalShotsStorage[videoContextId];
    delete shotsListeners[videoContextId];
    setShotsLocal([]);
  }, [videoContextId]);

  return {
    shots,
    setShots,
    initializeShots,
    clearShots
  };
};

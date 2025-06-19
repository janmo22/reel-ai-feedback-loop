
import { useState, useCallback, useEffect } from 'react';
import { Shot } from './use-advanced-editor';

// Global storage for shots per video context
const globalShotsStorage: { [videoContextId: string]: Shot[] } = {};
const shotsListeners: { [videoContextId: string]: Set<(shots: Shot[]) => void> } = {};

export const useSharedShots = (videoContextId: string = 'default') => {
  // Initialize global storage and listeners for this context if they don't exist
  if (!globalShotsStorage[videoContextId]) {
    globalShotsStorage[videoContextId] = [];
  }
  if (!shotsListeners[videoContextId]) {
    shotsListeners[videoContextId] = new Set();
  }

  const [shots, setShotsLocal] = useState<Shot[]>(() => 
    globalShotsStorage[videoContextId] || []
  );

  // Register this component as a listener
  useEffect(() => {
    const updateShots = (newShots: Shot[]) => {
      console.log('Actualizando shots locales:', newShots.length);
      setShotsLocal(newShots);
    };

    shotsListeners[videoContextId].add(updateShots);

    // Sync with current global state
    setShotsLocal(globalShotsStorage[videoContextId]);

    return () => {
      shotsListeners[videoContextId].delete(updateShots);
    };
  }, [videoContextId]);

  // Function to update shots globally
  const setShots = useCallback((newShots: Shot[] | ((prev: Shot[]) => Shot[])) => {
    const currentShots = globalShotsStorage[videoContextId] || [];
    const updatedShots = typeof newShots === 'function' 
      ? newShots(currentShots)
      : newShots;
    
    console.log('Actualizando tomas globalmente:', {
      videoContextId,
      antes: currentShots.length,
      después: updatedShots.length,
      listenersCount: shotsListeners[videoContextId]?.size || 0
    });
    
    // Update global storage
    globalShotsStorage[videoContextId] = updatedShots;
    
    // Notify all listeners in this video context
    shotsListeners[videoContextId]?.forEach(listener => {
      listener(updatedShots);
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
    setShots([]);
  }, [videoContextId, setShots]);

  return {
    shots,
    setShots,
    initializeShots,
    clearShots
  };
};

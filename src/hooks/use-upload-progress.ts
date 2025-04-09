
import { useState, useEffect } from 'react';

export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (simulationActive && progress < 99) {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Simulate slower progress as it approaches completion
          const increment = Math.max(1, 10 - Math.floor(prevProgress / 10));
          return Math.min(99, prevProgress + increment);
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive, progress]);
  
  const startSimulation = () => {
    setProgress(0);
    setIsComplete(false);
    setSimulationActive(true);
  };
  
  const stopSimulation = (finalValue = 100) => {
    setSimulationActive(false);
    setProgress(finalValue);
    setIsComplete(finalValue === 100);
  };
  
  const trackProgress = (bytesUploaded: number, totalBytes: number) => {
    const percentage = Math.round((bytesUploaded / totalBytes) * 100);
    setProgress(percentage);
    
    if (percentage >= 100) {
      setIsComplete(true);
    }
  };

  // Create a proper SupabaseProgressCallback
  const createProgressHandler = (totalSize: number) => {
    return (progress: { loaded: number; total: number }) => {
      trackProgress(progress.loaded, totalSize);
    };
  };
  
  return { 
    progress, 
    setProgress, 
    trackProgress, 
    startSimulation, 
    stopSimulation,
    isComplete,
    createProgressHandler
  };
}

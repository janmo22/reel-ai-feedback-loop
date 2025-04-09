
import { useState } from 'react';

export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  
  // This is a simple hook that can be expanded in the future
  // to track upload progress for Supabase Storage uploads
  
  const trackProgress = (bytesUploaded: number, totalBytes: number) => {
    const percentage = Math.round((bytesUploaded / totalBytes) * 100);
    setProgress(percentage);
  };
  
  return { progress, trackProgress, setProgress };
}

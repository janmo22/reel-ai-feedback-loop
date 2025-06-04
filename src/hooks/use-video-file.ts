
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Maximum allowed file size increased to 100MB
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function useVideoFile() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo de video válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Por favor, sube un archivo menor a 100MB.",
        variant: "destructive"
      });
      return;
    }
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    
    return file.name.replace(/\.[^/.]+$/, ""); // Return the file name without extension
  };
  
  const removeVideo = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoFile(null);
    setVideoSrc(null);
  };

  return {
    videoFile,
    videoSrc,
    handleFile,
    removeVideo
  };
}


import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { VideoUploadResponse } from "@/types";
import { useVideoFile } from "@/hooks/use-video-file";
import { useMissions } from "@/hooks/use-missions";
import { 
  saveVideoMetadata, 
  updateVideoStatus,
  uploadVideoToWebhook 
} from "@/utils/video-upload-service";

export function useVideoUpload(onUploadComplete: (data: {
  video: File;
  title: string;
  description: string;
  missions: string[];
  mainMessage: string;
  response: VideoUploadResponse;
}) => void) {
  const { videoFile, videoSrc, handleFile: processFile, removeVideo } = useVideoFile();
  const { missions, handleMissionChange, resetMissions } = useMissions();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainMessage, setMainMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { progress: uploadProgress, startSimulation, stopSimulation, isComplete } = useUploadProgress();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleFile = (file: File) => {
    const fileName = processFile(file);
    if (fileName) {
      setTitle(fileName);
    }
  };
  
  const resetForm = () => {
    removeVideo();
    setTitle("");
    setDescription("");
    setMainMessage("");
    resetMissions();
  };

  const validateForm = (): boolean => {
    if (!videoFile) {
      toast({
        title: "Error",
        description: "Por favor, sube un video primero.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un título para tu reel.",
        variant: "destructive"
      });
      return false;
    }
    
    if (missions.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos una misión para tu reel.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!mainMessage.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa el mensaje principal de tu reel.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para subir videos.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !videoFile || !user) {
      return;
    }
    
    setIsUploading(true);
    startSimulation(); // Start a progress simulation
    
    try {
      const videoId = uuidv4();
      
      // Save metadata to the database with "processing" status
      await saveVideoMetadata(videoId, user.id, title, description);
      
      // Send data to webhook using fetch directly
      const response = await uploadVideoToWebhook({
        videoId,
        userId: user.id,
        videoFile,
        title,
        description,
        missions,
        mainMessage
      });
      
      // Update video status in database (still "processing")
      await updateVideoStatus(videoId, 'processing');
      
      stopSimulation(100);
      toast({
        title: "¡Video enviado!",
        description: "Tu reel ha sido enviado para análisis.",
      });
      
      setIsUploading(false);
      
      onUploadComplete({
        video: videoFile,
        title,
        description,
        missions,
        mainMessage,
        response,
      });
    } catch (error: any) {
      console.error("Error en el proceso:", error);
      stopSimulation(0);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return {
    videoFile,
    videoSrc,
    title,
    description,
    mainMessage,
    missions,
    isUploading,
    uploadProgress,
    isComplete,
    setTitle,
    setDescription,
    setMainMessage,
    handleMissionChange,
    handleFile,
    removeVideo: resetForm,
    handleSubmit,
  };
}

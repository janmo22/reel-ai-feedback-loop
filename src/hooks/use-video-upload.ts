
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { VideoUploadResponse } from "@/types";
import { useVideoFile } from "@/hooks/use-video-file";
import { useMissions } from "@/hooks/use-missions";
import { 
  createVideoRecord,
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
    startSimulation();
    
    try {
      console.log("Iniciando proceso de upload y análisis...");
      
      // Step 1: Create video record in Supabase
      const videoData = await createVideoRecord(
        user.id,
        title,
        description,
        missions,
        mainMessage
      );
      
      const videoId = videoData.id;
      console.log("Video record created with ID:", videoId);
      
      // Step 2: Call onUploadComplete immediately with basic data
      onUploadComplete({
        video: videoFile,
        title,
        description,
        missions,
        mainMessage,
        response: {
          success: true,
          videoId,
          message: "Video enviado para análisis. El procesamiento comenzará inmediatamente."
        },
      });
      
      // Step 3: Continue with analysis in the background
      try {
        console.log("Enviando video para análisis con Edge Function...");
        
        await uploadVideoToWebhook({
          videoId,
          userId: user.id,
          videoFile,
          title,
          description,
          missions,
          mainMessage
        });
        
        console.log("Video enviado exitosamente para análisis");
        stopSimulation(100);
        
        toast({
          title: "¡Análisis completado! 🎬",
          description: "Tu reel ha sido analizado exitosamente. Revisa los resultados.",
        });
        
      } catch (analysisError: any) {
        console.error("Error en el análisis:", analysisError);
        stopSimulation(0);
        
        toast({
          title: "Error en el análisis",
          description: "Hubo un problema procesando tu video. Puedes intentar de nuevo más tarde.",
          variant: "destructive"
        });
      }
      
      setIsUploading(false);
      
    } catch (error: any) {
      console.error("Error en el proceso completo:", error);
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

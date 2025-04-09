
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { VideoUploadResponse } from "@/types";

export function useVideoUpload(onUploadComplete: (data: {
  video: File;
  title: string;
  description: string;
  missions: string[];
  mainMessage: string;
  response: VideoUploadResponse;
}) => void) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainMessage, setMainMessage] = useState("");
  const [missions, setMissions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { progress: uploadProgress, startSimulation, stopSimulation, isComplete } = useUploadProgress();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const MAX_FILE_SIZE = 500 * 1024 * 1024;
  const WEBHOOK_URL = "https://hazloconflow.app.n8n.cloud/webhook/69fef48e-0c7e-4130-b420-eea7347e1dab";

  const handleMissionChange = (mission: string) => {
    setMissions(prev => {
      if (prev.includes(mission)) {
        return prev.filter(m => m !== mission);
      } else {
        return [...prev, mission];
      }
    });
  };
  
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
        description: "El archivo es demasiado grande. Por favor, sube un archivo menor a 500MB.",
        variant: "destructive"
      });
      return;
    }
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setTitle(fileName);
  };
  
  const removeVideo = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoFile(null);
    setVideoSrc(null);
    setTitle("");
    setDescription("");
    setMainMessage("");
    setMissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        title: "Error",
        description: "Por favor, sube un video primero.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un título para tu reel.",
        variant: "destructive"
      });
      return;
    }
    
    if (missions.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos una misión para tu reel.",
        variant: "destructive"
      });
      return;
    }
    
    if (!mainMessage.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa el mensaje principal de tu reel.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para subir videos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    startSimulation(); // Iniciamos una simulación de progreso
    
    try {
      const videoId = uuidv4();
      
      // Guardar los metadatos en la base de datos con estado "processing"
      console.log("Guardando metadatos en Supabase...");
      try {
        await supabase
          .from('videos')
          .insert([
            {
              id: videoId,
              user_id: user.id,
              title,
              description,
              video_url: "placeholder-url", // URL placeholder ya que no subimos el video
              status: 'processing'
            }
          ]);
        
        console.log("Metadatos guardados en Supabase correctamente");
      } catch (dbError) {
        console.error("Error guardando en Supabase:", dbError);
        throw new Error(`Error guardando metadatos: ${dbError}`);
      }
      
      // Enviar los datos al webhook usando fetch directamente
      console.log("Enviando datos al webhook:", WEBHOOK_URL);
      
      // Crear un objeto FormData y añadir todos los datos
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userId", user.id);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("missions", JSON.stringify(missions));
      formData.append("mainMessage", mainMessage);
      
      // Añadir el archivo de video al FormData
      formData.append("video", videoFile);
      
      console.log("Enviando datos y video en binario al webhook");
      
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          body: formData,
          mode: "no-cors", // Importante para evitar errores de CORS
        });
        
        console.log("Datos enviados al webhook", response);
        
        // Actualizamos el estado del video en la base de datos pero seguimos mostrando 'processing'
        try {
          await supabase
            .from('videos')
            .update({ status: 'processing' })
            .eq('id', videoId);
          
          console.log("Estado del video actualizado en Supabase");
        } catch (updateError) {
          console.error("Error actualizando estado:", updateError);
        }
        
        // Simulamos una respuesta exitosa ya que no podemos obtener la respuesta real con no-cors
        stopSimulation(100);
        toast({
          title: "¡Video enviado!",
          description: "Tu reel ha sido enviado para análisis.",
        });
        
        // Notificar que la carga se ha completado
        setIsUploading(false);
        
        onUploadComplete({
          video: videoFile,
          title,
          description,
          missions,
          mainMessage,
          response: { status: "success", videoId },
        });
      } catch (error) {
        console.error("Error en la conexión con el webhook", error);
        stopSimulation(0);
        setIsUploading(false);
        throw new Error(`Error en la conexión con el webhook: ${error}`);
      }
      
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
    removeVideo,
    handleSubmit,
  };
}

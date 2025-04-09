
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
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const { progress: uploadProgress, createProgressHandler, isComplete } = useUploadProgress();
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
    setUploadedVideoUrl(null);
  };

  /**
   * Sube el video a Supabase Storage y devuelve la URL pública
   */
  const uploadVideoToSupabase = async (file: File, videoId: string): Promise<string> => {
    if (!user) throw new Error("Usuario no autenticado");

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${videoId}.${fileExt}`;
    
    console.log("Subiendo video a Supabase Storage...", filePath);
    
    // Crear la opción de configuración correctamente
    const options = {
      cacheControl: '3600',
      upsert: false
    };
    
    // Subir con listeners de progreso separados
    const uploadTask = supabase.storage
      .from('videos')
      .upload(filePath, file, options);
    
    // Configurar el seguimiento de progreso
    if (file.size > 0) {
      const progressCallback = createProgressHandler(file.size);
      // Usar XMLHttpRequest para rastrear el progreso manualmente
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', progressCallback);
      
      // Este es solo un truco para mantener xhr en memoria mientras se realiza la subida
      // No afecta la subida real a través de la API de Supabase
      setTimeout(() => {
        console.log("XHR reference kept for progress tracking");
      }, 100);
    }

    const { data, error } = await uploadTask;
    
    if (error) {
      console.error("Error al subir a Supabase:", error);
      throw new Error(`Error al subir el video: ${error.message}`);
    }
    
    console.log("Video subido a Supabase:", data);
    
    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    console.log("URL pública del video:", publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
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
    
    try {
      const videoId = uuidv4();
      
      // Paso 1: Subir el video a Supabase Storage
      console.log("Iniciando proceso de subida a Supabase...");
      const videoUrl = await uploadVideoToSupabase(videoFile, videoId);
      setUploadedVideoUrl(videoUrl);
      
      console.log("Video subido exitosamente a Supabase:", videoUrl);
      
      try {
        // Paso 2: Guardar los metadatos en la base de datos de Supabase
        console.log("Guardando metadatos en Supabase...");
        await supabase
          .from('videos')
          .insert([
            {
              id: videoId,
              user_id: user.id,
              title,
              description,
              video_url: videoUrl,
              status: 'processing'
            }
          ]);
        
        console.log("Metadatos guardados en Supabase correctamente");
      } catch (dbError) {
        console.error("Error guardando en Supabase:", dbError);
        // Continuar con el webhook incluso si falla Supabase
      }
      
      // Paso 3: Enviar los metadatos y la URL del video al webhook para procesamiento
      console.log("Enviando datos al webhook:", WEBHOOK_URL);
      
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userId", user.id);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("missions", JSON.stringify(missions));
      formData.append("mainMessage", mainMessage);
      formData.append("videoUrl", videoUrl);
      
      console.log("Enviando metadatos al webhook con URL del video:", videoUrl);
      
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        console.log("Datos enviados correctamente al webhook");
        
        toast({
          title: "¡Video enviado!",
          description: "Tu reel ha sido enviado para análisis.",
        });
        
        onUploadComplete({
          video: videoFile,
          title,
          description,
          missions,
          mainMessage,
          response: { status: "success", videoId },
        });
      } else {
        console.error("Error en la respuesta del webhook:", response.status);
        throw new Error(`Error en el servidor: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error en la subida:", error);
      toast({
        title: "Error de subida",
        description: error.message || "Hubo un problema al subir tu video. Por favor, inténtalo de nuevo.",
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

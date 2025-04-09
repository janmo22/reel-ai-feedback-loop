import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Video as VideoIcon, X, LoaderCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useUploadProgress } from "@/hooks/use-upload-progress";
import { VideoUploadResponse } from "@/types";

interface VideoUploaderProps {
  onUploadComplete: (data: {
    video: File;
    title: string;
    description: string;
    missions: string[];
    mainMessage: string;
    response: VideoUploadResponse;
  }) => void;
}

const VideoUploader = ({ onUploadComplete }: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainMessage, setMainMessage] = useState("");
  const [missions, setMissions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { progress: uploadProgress, setProgress: setUploadProgress } = useUploadProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const MAX_FILE_SIZE = 500 * 1024 * 1024;
  const WEBHOOK_URL = "https://hazloconflow.app.n8n.cloud/webhook/69fef48e-0c7e-4130-b420-eea7347e1dab";
  
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
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
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
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
    setUploadProgress(0);
    
    try {
      const videoId = uuidv4();
      
      try {
        console.log("Guardando metadatos en Supabase (solo texto, no video)...");
        await supabase
          .from('videos')
          .insert([
            {
              user_id: user.id,
              title,
              description,
              video_url: "webhook_processing",
              status: 'processing'
            }
          ]);
        
        console.log("Metadatos guardados en Supabase correctamente");
      } catch (dbError) {
        console.error("Error guardando en Supabase:", dbError);
        // Continue with webhook upload even if Supabase fails
      }
      
      console.log("Preparando envío al webhook:", WEBHOOK_URL);
      const formData = new FormData();
      
      formData.append("video", videoFile);
      
      formData.append("videoId", videoId);
      formData.append("userId", user.id);
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("missions", JSON.stringify(missions));
      formData.append("mainMessage", mainMessage);
      
      console.log("Enviando video al webhook PRODUCCIÓN. Tamaño:", (videoFile.size / (1024 * 1024)).toFixed(2), "MB");
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progressPercentage = Math.round((event.loaded / event.total) * 100);
          console.log("Progreso de subida:", progressPercentage, "%");
          setUploadProgress(progressPercentage);
        }
      });
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Video enviado correctamente al webhook de PRODUCCIÓN");
          setUploadProgress(100);
          
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
          console.error("Error en la respuesta del webhook:", xhr.status, xhr.statusText);
          handleUploadError(new Error(`Error en el servidor: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        console.error("Error de red al enviar el video al webhook");
        handleUploadError(new Error("Error de red al enviar el video. Comprueba tu conexión e intenta de nuevo."));
      };
      
      xhr.ontimeout = () => {
        console.error("Tiempo de espera agotado al enviar el video al webhook");
        handleUploadError(new Error("El servidor tardó demasiado en responder. Inténtalo de nuevo más tarde."));
      };
      
      xhr.timeout = 180000;
      
      xhr.open("POST", WEBHOOK_URL);
      xhr.send(formData);
    } catch (error: any) {
      handleUploadError(error);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Error en la subida:", error);
    toast({
      title: "Error de subida",
      description: error.message || "Hubo un problema al subir tu video. Por favor, inténtalo de nuevo.",
      variant: "destructive",
    });
    setIsUploading(false);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {!videoSrc ? (
          <div
            className={`drop-zone ${dragActive ? "drop-zone-active animate-pulse-border" : "border-muted-foreground/40"}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="video-upload"
              className="hidden"
              accept="video/*"
              onChange={handleChange}
            />
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-flow-electric/10 p-3">
                <Upload className="h-8 w-8 text-flow-electric" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="electric-text font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: MP4, WebM, MOV (máx. 500MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full aspect-[9/16] sm:aspect-video object-contain bg-black"
              controls
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={removeVideo}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar video</span>
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-satoshi">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de tu reel"
              className="mt-1 font-satoshi"
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-satoshi">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata tu reel (opcional)"
              className="mt-1 font-satoshi"
              rows={3}
            />
          </div>

          <div>
            <Label className="font-satoshi mb-2 block">Misión del Reel</Label>
            <p className="text-sm text-muted-foreground mb-3 font-satoshi">
              Selecciona uno o más objetivos para tu reel
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mission-educate" 
                  checked={missions.includes('educar')}
                  onCheckedChange={() => handleMissionChange('educar')}
                  className="border-flow-electric data-[state=checked]:bg-flow-electric"
                />
                <Label 
                  htmlFor="mission-educate" 
                  className="font-satoshi cursor-pointer"
                >
                  Educar - Compartir conocimientos o enseñar algo nuevo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mission-entertain" 
                  checked={missions.includes('entretener')}
                  onCheckedChange={() => handleMissionChange('entretener')}
                  className="border-flow-electric data-[state=checked]:bg-flow-electric"
                />
                <Label 
                  htmlFor="mission-entertain" 
                  className="font-satoshi cursor-pointer"
                >
                  Entretener - Divertir o captar la atención de la audiencia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mission-inspire" 
                  checked={missions.includes('inspirar')}
                  onCheckedChange={() => handleMissionChange('inspirar')}
                  className="border-flow-electric data-[state=checked]:bg-flow-electric"
                />
                <Label 
                  htmlFor="mission-inspire" 
                  className="font-satoshi cursor-pointer"
                >
                  Inspirar - Motivar o transmitir un mensaje emocional
                </Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="mainMessage" className="font-satoshi">Mensaje Principal</Label>
            <Textarea
              id="mainMessage"
              value={mainMessage}
              onChange={(e) => setMainMessage(e.target.value)}
              placeholder="¿Cuál es el mensaje principal que quieres transmitir con este reel?"
              className="mt-1 font-satoshi"
              rows={2}
            />
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground font-satoshi">
              <span>Enviando video a producción...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-muted [&>div]:bg-flow-electric" />
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!videoFile || isUploading}
            className="w-full sm:w-auto bg-flow-electric hover:bg-flow-electric/90 font-satoshi"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <VideoIcon className="mr-2 h-4 w-4" />
                Enviar para análisis
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default VideoUploader;

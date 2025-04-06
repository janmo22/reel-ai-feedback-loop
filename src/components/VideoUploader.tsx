
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Video, X, Play, CheckCircle, LoaderCircle } from "lucide-react";

interface VideoUploaderProps {
  onUploadComplete: (data: {
    video: File;
    title: string;
    description: string;
    response: any;
  }) => void;
}

const VideoUploader = ({ onUploadComplete }: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
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
  
  const handleFile = (file: File) => {
    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo de video válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Por favor, sube un archivo menor a 50MB.",
        variant: "destructive"
      });
      return;
    }
    
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    
    // Auto-generate title from filename
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
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title);
      formData.append("description", description);
      
      const response = await fetch(
        "https://primary-production-9b33.up.railway.app/webhook-test/69fef48e-0c7e-4130-b420-eea7347e1dab",
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast({
        title: "¡Video subido!",
        description: "Tu reel ha sido enviado para análisis.",
      });
      
      onUploadComplete({
        video: videoFile,
        title,
        description,
        response: data,
      });
      
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error de subida",
        description: "Hubo un problema al subir tu video. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="text-primary font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: MP4, WebM, MOV (máx. 50MB)
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
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de tu reel"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata tu reel (opcional)"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!videoFile || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
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

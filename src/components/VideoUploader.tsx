import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Video, X, Play, CheckCircle, LoaderCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoUploaderProps {
  onUploadComplete: (data: {
    video: File;
    title: string;
    description: string;
    missions: string[];
    mainMessage: string;
    response: any;
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
  const [uploadProgress, setUploadProgress] = useState(0);
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
    
    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Por favor, sube un archivo menor a 200MB.",
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
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("missions", JSON.stringify(missions));
      formData.append("mainMessage", mainMessage);
      
      const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const webhookUrl = `https://hazloconflow.app.n8n.cloud/webhook-test/video-upload-${randomHex}`;
      
      const xhr = new XMLHttpRequest();
      
      xhr.open("POST", webhookUrl, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let responseData;
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch {
            responseData = { message: 'Success' };
          }
          
          toast({
            title: "¡Video subido!",
            description: "Tu reel ha sido enviado para análisis.",
          });
          
          onUploadComplete({
            video: videoFile,
            title,
            description,
            missions,
            mainMessage,
            response: responseData,
          });
        } else {
          throw new Error(`Error: ${xhr.status}`);
        }
        setIsUploading(false);
      };
      
      xhr.onerror = () => {
        console.error("Error uploading video:", xhr.statusText);
        toast({
          title: "Error de subida",
          description: "Hubo un problema al subir tu video. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error de subida",
        description: "Hubo un problema al subir tu video. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
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
              <div className="rounded-full bg-flow-electric/10 p-3">
                <Upload className="h-8 w-8 text-flow-electric" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  <span className="electric-text font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: MP4, WebM, MOV (máx. 200MB)
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
              <span>Subiendo...</span>
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

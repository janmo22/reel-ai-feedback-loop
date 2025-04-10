import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, LoaderCircle, VideoIcon, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
interface UploadFormProps {
  title: string;
  description: string;
  mainMessage: string;
  missions: string[];
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onMainMessageChange: (message: string) => void;
  onMissionChange: (mission: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  isComplete: boolean;
}
const UploadForm: React.FC<UploadFormProps> = ({
  title,
  description,
  mainMessage,
  missions,
  onTitleChange,
  onDescriptionChange,
  onMainMessageChange,
  onMissionChange,
  onSubmit,
  isUploading,
  uploadProgress,
  isComplete
}) => {
  return <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="font-satoshi text-sm font-medium">Título</Label>
        <Input id="title" value={title} onChange={e => onTitleChange(e.target.value)} placeholder="Título de tu reel" className="mt-1 font-satoshi border-border/60 focus:border-flow-electric transition-all" />
      </div>

      <div>
        <Label htmlFor="description" className="font-satoshi text-sm font-medium">Descripción</Label>
        <Textarea id="description" value={description} onChange={e => onDescriptionChange(e.target.value)} placeholder="Describe de qué trata tu reel (opcional)" className="mt-1 font-satoshi border-border/60 focus:border-flow-electric transition-all" rows={3} />
      </div>

      <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
        <Label className="font-satoshi text-sm font-medium mb-2 block">Misión del Reel</Label>
        <p className="text-sm text-muted-foreground mb-3 font-satoshi">
          Selecciona uno o más objetivos para tu reel
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MissionButton id="mission-educate" isSelected={missions.includes('educar')} onClick={() => onMissionChange('educar')} title="Educar" description="Compartir conocimientos o enseñar algo nuevo" />
          
          <MissionButton id="mission-entertain" isSelected={missions.includes('entretener')} onClick={() => onMissionChange('entretener')} title="Entretener" description="Divertir o captar la atención de la audiencia" />
          
          <MissionButton id="mission-inspire" isSelected={missions.includes('inspirar')} onClick={() => onMissionChange('inspirar')} title="Inspirar" description="Motivar o transmitir un mensaje emocional" />
        </div>
      </div>

      <div>
        <Label htmlFor="mainMessage" className="font-satoshi text-sm font-medium">Mensaje Principal</Label>
        <Textarea id="mainMessage" value={mainMessage} onChange={e => onMainMessageChange(e.target.value)} placeholder="¿Cuál es el mensaje principal que quieres transmitir con este reel?" className="mt-1 font-satoshi border-border/60 focus:border-flow-electric transition-all" rows={2} />
      </div>

      {isUploading && <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border/40">
          <div className="flex justify-between items-center text-sm font-satoshi">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {isComplete ? "Video subido correctamente" : "Subiendo video a la nube..."}
              </span>
              {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
            <span className="text-flow-electric font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2 bg-muted [&>div]:bg-flow-electric" />
        </div>}

      <div className="flex justify-end pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={!title || isUploading || missions.length === 0 || !mainMessage} className="w-full sm:w-auto bg-flow-electric hover:bg-flow-electric/90 font-medium py-6 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-flow-dark bg-zinc-400 hover:bg-zinc-300">
                {isUploading ? <>
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </> : <>
                    <VideoIcon className="mr-2 h-5 w-5" />
                    Enviar para análisis
                  </>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {!title ? 'Ingresa un título' : missions.length === 0 ? 'Selecciona al menos una misión' : !mainMessage ? 'Ingresa el mensaje principal' : 'Enviar reel para análisis de IA'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </form>;
};
const MissionButton = ({
  id,
  isSelected,
  onClick,
  title,
  description
}) => {
  return <button type="button" id={id} onClick={onClick} className={`flex flex-col items-start text-left p-3 rounded-md border transition-all duration-200 ${isSelected ? "border-flow-electric bg-flow-electric/10 shadow-md" : "border-border/60 hover:border-flow-electric/60 hover:bg-flow-electric/5"}`}>
      <div className="flex items-center justify-between w-full">
        <span className={`font-medium ${isSelected ? "text-flow-electric" : ""}`}>
          {title}
        </span>
        {isSelected && <Check className="h-4 w-4 text-flow-electric" />}
      </div>
      <span className="text-xs text-muted-foreground mt-1">
        {description}
      </span>
    </button>;
};
export default UploadForm;
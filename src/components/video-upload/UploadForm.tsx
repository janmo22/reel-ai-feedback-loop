
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircle, VideoIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

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
  isComplete,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="font-satoshi">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título de tu reel"
          className="mt-1 font-satoshi"
        />
      </div>

      <div>
        <Label htmlFor="description" className="font-satoshi">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
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
              onCheckedChange={() => onMissionChange('educar')}
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
              onCheckedChange={() => onMissionChange('entretener')}
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
              onCheckedChange={() => onMissionChange('inspirar')}
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
          onChange={(e) => onMainMessageChange(e.target.value)}
          placeholder="¿Cuál es el mensaje principal que quieres transmitir con este reel?"
          className="mt-1 font-satoshi"
          rows={2}
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground font-satoshi">
            <div className="flex items-center gap-2">
              <span>
                {isComplete 
                  ? "Video subido correctamente" 
                  : "Subiendo video a la nube..."}
              </span>
              {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2 bg-muted [&>div]:bg-flow-electric" />
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!title || isUploading}
          className="w-full sm:w-auto bg-flow-electric hover:bg-flow-electric/90 font-satoshi"
        >
          {isUploading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
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
  );
};

export default UploadForm;

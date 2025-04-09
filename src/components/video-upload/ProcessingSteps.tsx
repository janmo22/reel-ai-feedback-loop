
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProcessingStepsProps {
  currentStep: "processing" | "complete";
  onContinue: () => void;
  loadingPhrase?: string;
}

const ProcessingSteps = ({ currentStep, onContinue, loadingPhrase }: ProcessingStepsProps) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (currentStep === "processing") {
      // Simulamos un progreso gradual durante el procesamiento
      const timer = setInterval(() => {
        setProgress(prev => {
          // Avanzamos hasta 95% máximo durante el procesamiento
          if (prev < 95) {
            // La velocidad disminuye a medida que avanza
            return prev + (0.5 * (1 - prev / 100));
          }
          return prev;
        });
      }, 1000);
      
      return () => {
        clearInterval(timer);
      };
    } else if (currentStep === "complete") {
      setProgress(100);
    }
  }, [currentStep]);
  
  return (
    <div className="mt-8 bg-muted/30 rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {currentStep === "processing" ? "Analizando tu reel" : "¡Análisis completado!"}
        </h2>
        <p className="text-muted-foreground">
          {currentStep === "processing" 
            ? "Nuestro equipo de IA está analizando tu contenido para ofrecerte insights valiosos"
            : "Ya tenemos el análisis completo de tu reel"
          }
        </p>
      </div>
      
      <div className="mb-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {currentStep === "processing" && loadingPhrase && (
          <div className="bg-muted/50 p-4 rounded-md text-center animate-pulse">
            <p className="text-sm italic">{loadingPhrase}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm">Reel recibido correctamente</span>
          </div>
          
          <div className="flex items-center">
            {currentStep === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            )}
            <span className="text-sm">Análisis de contenido</span>
          </div>
          
          <div className="flex items-center">
            {currentStep === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            )}
            <span className="text-sm">Generación de feedback</span>
          </div>
          
          <div className="flex items-center">
            {currentStep === "processing" ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
            )}
            <span className="text-sm">Preparación de resultados</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onContinue}
          disabled={currentStep === "processing"}
          className="px-8"
        >
          {currentStep === "processing" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentStep === "processing" ? "Procesando..." : "Ver resultados"}
        </Button>
      </div>
    </div>
  );
};

export default ProcessingSteps;

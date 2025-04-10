
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";

interface ProcessingStepsProps {
  currentStep: "processing" | "complete";
  loadingPhrase: string;
  onContinue: () => void;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({
  currentStep,
  loadingPhrase,
  onContinue,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto p-8 text-center flex flex-col items-center space-y-6 shadow-lg border-border/40">
      <div className="relative">
        {currentStep === "processing" ? (
          <div className="w-20 h-20 rounded-full bg-flow-electric/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-flow-electric animate-spin" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        )}
      </div>

      <div className="space-y-3 max-w-lg">
        <h2 className="text-2xl font-bold">
          {currentStep === "processing" ? "Analizando tu reel" : "¡Análisis completado!"}
        </h2>
        
        <p className="text-muted-foreground font-satoshi">
          {currentStep === "processing" ? (
            <>
              {loadingPhrase}
              <span className="inline-block animate-pulse">...</span>
            </>
          ) : (
            "Tu reel ha sido analizado con éxito. Ahora puedes ver los resultados y mejorar tu contenido."
          )}
        </p>
      </div>

      {currentStep === "complete" && (
        <Button 
          onClick={onContinue}
          className="mt-4 bg-flow-electric hover:bg-flow-electric/90 text-white px-6 py-2"
        >
          Ver resultados
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      {currentStep === "processing" && (
        <div className="text-sm text-muted-foreground italic max-w-lg">
          Este proceso puede tomar unos minutos. Te redirigiremos automáticamente cuando esté listo.
        </div>
      )}
    </Card>
  );
};

export default ProcessingSteps;


import React from "react";
import { Check, BrainCircuit } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface ProcessingStepsProps {
  currentStep: "upload" | "processing" | "complete";
  onContinue: () => void;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ 
  currentStep,
  onContinue
}) => {
  if (currentStep === "upload") {
    return null;
  }

  if (currentStep === "processing") {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-flow-electric/10 mb-6">
          <div className="w-8 h-8 border-4 border-t-flow-electric border-r-flow-electric border-b-flow-electric/30 border-l-flow-electric/30 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">PROCESANDO TU REEL</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-4 font-satoshi">
          Nuestro modelo de IA está analizando tu video. Esto puede tomar unos minutos.
        </p>
        
        {/* Animated elements to show AI processing */}
        <div className="max-w-md mx-auto mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 text-flow-electric animate-pulse" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-10 bg-muted rounded-md animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="h-2 w-64 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-flow-electric rounded-full animate-progress"></div>
        </div>
        
        <style>
          {`
            @keyframes progress {
              0% { width: 5%; }
              20% { width: 25%; }
              40% { width: 42%; }
              60% { width: 58%; }
              80% { width: 75%; }
              95% { width: 92%; }
              100% { width: 98%; }
            }
            .animate-progress {
              animation: progress 90s ease-in-out forwards;
            }
          `}
        </style>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">¡REEL PROCESADO CON ÉXITO!</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6 font-satoshi">
          Tu video ha sido procesado y los resultados están listos para ser visualizados.
        </p>
        <button
          onClick={onContinue}
          className="bg-flow-electric text-white hover:bg-flow-electric/90 px-6 py-3 rounded-md font-medium inline-flex items-center font-satoshi"
        >
          Ver resultados
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
};

export default ProcessingSteps;

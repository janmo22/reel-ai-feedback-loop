
import React, { useState, useEffect } from "react";
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
  const [messageIndex, setMessageIndex] = useState(0);
  
  const funMessages = [
    "Analizando tu reel con precisión algorítmica...",
    "Procesando cada frame para detectar patrones de engagement...",
    "Comparando tu contenido con millones de ejemplos de éxito...",
    "Evaluando el potencial de retención de audiencia...",
    "Decodificando las claves visuales de tu contenido...",
    "Midiendo el ritmo narrativo de tu reel...",
    "Calculando la efectividad de tus transiciones visuales...",
    "Analizando el equilibrio entre información y entretenimiento...",
    "Evaluando la coherencia estética de tu contenido...",
    "Determinando puntos óptimos para llamadas a la acción...",
    "Calibrando métricas de impacto visual y auditivo...",
    "Procesando elementos de storytelling para maximizar impacto...",
    "Aplicando modelos predictivos de comportamiento de audiencia...",
    "Optimizando recomendaciones basadas en tendencias actuales...",
  ];
  
  useEffect(() => {
    if (currentStep === "processing") {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % funMessages.length);
      }, 4000); // Cambiar mensaje cada 4 segundos
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);
  
  if (currentStep === "upload") {
    return null;
  }

  if (currentStep === "processing") {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-flow-blue/10 mb-8">
          <div className="w-8 h-8 border-4 border-t-flow-blue border-r-flow-blue border-b-flow-blue/20 border-l-flow-blue/20 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight">PROCESANDO TU REEL</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          Nuestro modelo de IA está analizando tu video. Esto puede tomar entre 1-2 minutos.
        </p>
        
        {/* Fun animated message */}
        <div className="max-w-md mx-auto mt-6 mb-8 min-h-[60px] flex items-center justify-center">
          <p className="text-flow-blue font-medium animate-fade-in text-sm">
            {funMessages[messageIndex]}
          </p>
        </div>
        
        {/* Animated elements to show AI processing */}
        <div className="max-w-md mx-auto mt-8 mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 text-flow-blue animate-pulse" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-8 bg-muted rounded-md animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="h-1.5 w-64 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-flow-blue rounded-full animate-progress"></div>
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
            
            @keyframes fade-in {
              0% { opacity: 0; transform: translateY(10px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-10px); }
            }
            .animate-fade-in {
              animation: fade-in 4s ease-in-out;
            }
          `}
        </style>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-8">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight">ANÁLISIS COMPLETADO</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Tu video ha sido procesado y los resultados están listos para ser visualizados.
        </p>
        <button
          onClick={onContinue}
          className="bg-flow-blue text-white hover:bg-flow-blue/90 px-6 py-3 rounded-md font-medium inline-flex items-center"
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


import React, { useState, useEffect } from "react";
import { Check, BrainCircuit, Sparkle, Zap, LineChart, Medal } from "lucide-react";
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
    // Mensajes originales mejorados
    "Analizando tu reel con precisión algorítmica...",
    "Procesando cada frame para detectar patrones de engagement...",
    "Comparando tu contenido con millones de ejemplos de éxito...",
    "Evaluando el potencial de retención de audiencia...",
    "Decodificando las claves visuales de tu contenido...",
    
    // Nuevos mensajes divertidos sobre IA y redes sociales
    "Preguntándole a ChatGPT qué opina de tu reel (¡solo bromeamos!)...",
    "Buscando la fórmula perfecta para que tu contenido se haga viral...",
    "Consultando con nuestros algoritmos qué hashtags funcionarán mejor...",
    "Analizando si tus transiciones pasarían el test de TikTok...",
    "Calculando cuántos corazones recibirá tu contenido...",
    "Midiendo la energía de tu hook en la escala Richter de engagement...",
    "Detectando si hay suficientes tendencias para impresionar al algoritmo...",
    "Comprobando si tu contenido pasará el filtro de la abuela del creador de Instagram...",
    "¡Ups! Casi recomendamos usar Vine... ¡menos mal que nuestros algoritmos se actualizan!",
    "Escaneando el nivel de originalidad... ¡nada de trends repetidos aquí!",
    "Analizando si tu audio es tan pegadizo que se quedará en la cabeza por días...",
    "Midiendo el factor 'pausa de scroll' de tu contenido...",
    "Calculando la proporción perfecta entre información y entretenimiento...",
    "Aplicando la física cuántica para predecir el reach de tu publicación...",
    "Buscando el momento exacto donde el espectador dirá '¡WOW!'...",
    "Comparando tu reel con la legendaria primera foto de Instagram...",
    "Consultando a nuestros expertos virtuales sobre tu potencial de viralidad...",
    "Midiendo cuánta dopamina generará tu contenido...",
    "Calculando el tiempo medio hasta que alguien comente '¡Necesito esto!'...",
    "Evaluando si tu reel merece estar en el Louvre de las redes sociales...",
    "Preparando recomendaciones basadas en lo que funciona y no en lo que está de moda...",
    "Convirtiendo datos en magia para potenciar tu contenido...",
    "Creando un mapa de calor de los puntos más interesantes de tu reel...",
  ];
  
  useEffect(() => {
    if (currentStep === "processing") {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % funMessages.length);
      }, 3500); // Cambiar mensaje cada 3.5 segundos
      
      return () => clearInterval(interval);
    }
  }, [currentStep]);
  
  if (currentStep === "upload") {
    return null;
  }

  if (currentStep === "processing") {
    return (
      <div className="text-center py-12 glass-panel rounded-lg px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-flow-blue/10 mb-8">
          <div className="w-10 h-10 border-4 border-t-flow-blue border-r-flow-blue border-b-flow-blue/20 border-l-flow-blue/20 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight electric-text">PROCESANDO TU REEL</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-4">
          Nuestro modelo de IA está analizando tu video. Esto puede tomar entre 1-2 minutos.
        </p>
        
        {/* Fun animated message with icons that change */}
        <div className="max-w-md mx-auto mt-6 mb-8 min-h-[80px] flex items-center justify-center">
          <div className="flex items-center animate-fade-in">
            {messageIndex % 5 === 0 && <BrainCircuit className="mr-2 h-5 w-5 text-flow-blue" />}
            {messageIndex % 5 === 1 && <Sparkle className="mr-2 h-5 w-5 text-flow-blue" />}
            {messageIndex % 5 === 2 && <Zap className="mr-2 h-5 w-5 text-flow-blue" />}
            {messageIndex % 5 === 3 && <LineChart className="mr-2 h-5 w-5 text-flow-blue" />}
            {messageIndex % 5 === 4 && <Medal className="mr-2 h-5 w-5 text-flow-blue" />}
            <p className="text-flow-blue font-medium text-base">
              {funMessages[messageIndex]}
            </p>
          </div>
        </div>
        
        {/* Animated elements to show AI processing */}
        <div className="max-w-md mx-auto mt-8 mb-10 relative">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="h-3 bg-muted rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  width: '100%'
                }}
              ></div>
            ))}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <BrainCircuit className="h-16 w-16 text-flow-blue animate-pulse" />
          </div>
        </div>
        
        <div className="h-2 w-64 bg-muted rounded-full mx-auto overflow-hidden mb-6">
          <div className="h-full bg-flow-blue rounded-full animate-progress"></div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Estamos trabajando duro para brindarte los mejores insights
        </p>
        
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
              animation: fade-in 3.5s ease-in-out;
            }
          `}
        </style>
      </div>
    );
  }

  if (currentStep === "complete") {
    return (
      <div className="text-center py-12 glass-panel rounded-lg px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-8">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight electric-text">ANÁLISIS COMPLETADO</h2>
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

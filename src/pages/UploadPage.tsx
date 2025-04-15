
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUploader from "@/components/video-upload/VideoUploader";
import ProgressSteps from "@/components/video-upload/ProgressSteps";
import ProcessingSteps from "@/components/video-upload/ProcessingSteps";
import { useToast } from "@/components/ui/use-toast";

// Frases divertidas para mostrar durante la carga
const funnyLoadingPhrases = [
  "La IA está analizando tu reel con microscopio digital...",
  "Enseñando a nuestros robots a apreciar tu creatividad...",
  "Calculando el potencial viral de tu reel pixel a pixel...",
  "Aplicando magia de inteligencia artificial a tu contenido...",
  "Nuestros algoritmos están fascinados con tu creatividad...",
  "Nuestra IA está impresionada con tu estilo único...",
  "Analizando métricas que ni sabías que existían...",
  "Preparando feedback que te sorprenderá...",
  "Entrenando a tu audiencia virtual para reaccionar...",
  "Haciendo que los algoritmos trabajen para ti...",
  "Transformando datos en estrategia de contenido...",
  "Descifrando el código del engagement perfecto...",
  "Nuestras neuronas artificiales están procesando tu reel...",
  "Consultando con ChatGPT para encontrar ideas brillantes...",
  "La IA está viendo tu reel en cámara lenta para no perderse nada...",
  "Nuestros algoritmos están teniendo una crisis existencial viendo tu creatividad...",
  "Reclutando expertos digitales de todo el metaverso...",
  "Comparando tu reel con miles de éxitos virales...",
  "Aplicando ciencia avanzada a tu contenido...",
  "¡La IA está bailando al ritmo de tu reel!",
];

const UploadPage = () => {
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");
  const [uploadData, setUploadData] = useState<any>(null);
  const [loadingPhrase, setLoadingPhrase] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rotamos las frases divertidas cada 5 segundos durante el procesamiento
  useEffect(() => {
    if (uploadStep === "processing") {
      // Seleccionar frase inicial
      setLoadingPhrase(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
      
      // Configurar intervalo para cambiar la frase
      const phraseInterval = setInterval(() => {
        setLoadingPhrase(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
      }, 5000);
      
      return () => {
        clearInterval(phraseInterval);
      };
    }
  }, [uploadStep]);
  
  const handleUploadComplete = (data: any) => {
    setUploadData(data);
    setUploadStep("processing");
    
    console.log("Información enviada correctamente, procesando análisis...");
    
    // Mostrar toast con una frase divertida
    const randomPhrase = funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)];
    toast({
      title: "¡Reel recibido! 🎬",
      description: randomPhrase,
      duration: 5000,
    });
    
    if (data.response && data.response.videoId) {
      // Navigate to the results page with the video ID to track progress
      navigate("/results", {
        state: {
          videoId: data.response.videoId,
          videoData: {
            title: data.title || "Video sin título",
            description: data.description || "",
            isProcessing: true // Add flag to indicate processing state
          }
        }
      });
    }
  };
  
  // Handler for the continue button in the ProcessingSteps component
  const handleContinue = () => {
    if (uploadData && uploadData.response && uploadData.response.videoId) {
      navigate("/results", {
        state: {
          videoId: uploadData.response.videoId,
          videoData: {
            title: uploadData.title || "Video sin título",
            description: uploadData.description || "",
            isProcessing: true // Add flag to indicate processing state
          }
        }
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      
      <main className="flex-1 py-8 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-flow-blue tracking-tight">
              ANALIZA TU REEL CON IA
            </h1>
            <p className="text-muted-foreground font-satoshi text-lg max-w-xl mx-auto">
              Sube tu reel para recibir feedback personalizado de IA y mejorar tu engagement
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <ProgressSteps currentStep={uploadStep} />
            
            {uploadStep === "upload" && (
              <VideoUploader onUploadComplete={handleUploadComplete} />
            )}
            
            {(uploadStep === "processing" || uploadStep === "complete") && (
              <ProcessingSteps 
                currentStep={uploadStep}
                loadingPhrase={loadingPhrase}
                onContinue={handleContinue}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

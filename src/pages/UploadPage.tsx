import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoUploader from "@/components/video-upload/VideoUploader";
import ProgressSteps from "@/components/video-upload/ProgressSteps";
import ProcessingSteps from "@/components/video-upload/ProcessingSteps";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  
  useEffect(() => {
    if (uploadStep === "processing") {
      setLoadingPhrase(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
      
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
    
    const randomPhrase = funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)];
    toast({
      title: "¡Reel recibido! 🎬",
      description: randomPhrase,
      duration: 5000,
    });
    
    if (data.response && data.response.videoId) {
      navigate("/results", {
        state: {
          videoId: data.response.videoId,
          videoData: {
            title: data.title || "Video sin título",
            description: data.description || "",
            isProcessing: true
          }
        }
      });
    }
  };
  
  const handleContinue = () => {
    if (uploadData && uploadData.response && uploadData.response.videoId) {
      navigate("/results", {
        state: {
          videoId: uploadData.response.videoId,
          videoData: {
            title: uploadData.title || "Video sin título",
            description: uploadData.description || "",
            isProcessing: true
          }
        }
      });
    }
  };
  
  return (
    <main className="py-8 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-tt-travels font-bold mb-2 text-gray-900">
            ANALIZA TU REEL CON IA
          </h1>
          <p className="text-muted-foreground font-satoshi text-lg max-w-xl mx-auto">
            Sube tu reel para recibir feedback personalizado de IA y mejorar tu engagement
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
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
  );
};

export default UploadPage;

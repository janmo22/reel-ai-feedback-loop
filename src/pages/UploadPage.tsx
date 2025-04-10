
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUploader from "@/components/video-upload/VideoUploader";
import ProgressSteps from "@/components/video-upload/ProgressSteps";
import ProcessingSteps from "@/components/video-upload/ProcessingSteps";
import { useToast } from "@/components/ui/use-toast";

// Frases divertidas para mostrar durante la carga
const funnyLoadingPhrases = [
  "La IA está analizando tu contenido píxel a píxel...",
  "Enseñando a nuestros robots a apreciar tu creatividad...",
  "Calculando el potencial viral de tu reel...",
  "Aplicando magia de inteligencia artificial...",
  "Convirtiendo algoritmos en insights útiles...",
  "Nuestra IA está impresionada con tu contenido...",
  "Analizando métricas que ni sabías que existían...",
  "Preparando feedback que te sorprenderá...",
  "Entrenando a tu audiencia virtual para reaccionar...",
  "Haciendo que los algoritmos trabajen para ti...",
  "Transformando datos en estrategia de contenido...",
  "Descifrando el código del engagement perfecto...",
];

const UploadPage = () => {
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");
  const [uploadData, setUploadData] = useState<any>(null);
  const [loadingPhrase, setLoadingPhrase] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rotamos las frases divertidas cada 5 segundos durante el procesamiento
  useState(() => {
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
  });
  
  const handleUploadComplete = (data: any) => {
    setUploadData(data);
    setUploadStep("processing");
    
    console.log("Información enviada correctamente, procesando análisis...");
    
    if (data.response && data.response.videoId) {
      // Navigate to the results page with the video ID to track progress
      navigate("/results", {
        state: {
          videoId: data.response.videoId,
          videoData: {
            title: data.title || "Video sin título",
            description: data.description || "",
          }
        }
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 electric-text">ENVIAR REEL PARA ANÁLISIS</h1>
            <p className="text-muted-foreground font-satoshi">
              Sube tu reel para recibir feedback personalizado de IA
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
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

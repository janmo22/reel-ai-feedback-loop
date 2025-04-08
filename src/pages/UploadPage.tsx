
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUploader from "@/components/VideoUploader";
import { Check, ArrowRight } from "lucide-react";

const UploadPage = () => {
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");
  const [uploadData, setUploadData] = useState<any>(null);
  const navigate = useNavigate();
  
  const handleUploadComplete = (data: any) => {
    setUploadData(data);
    setUploadStep("processing");
    
    // Simulate processing time (would normally happen on the server)
    setTimeout(() => {
      setUploadStep("complete");
    }, 3000);
  };
  
  const handleContinue = () => {
    // In real app, you would store the response and redirect to result page
    // Here we'll go to history page
    navigate("/history");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 electric-text">SUBIR REEL</h1>
            <p className="text-muted-foreground font-satoshi">
              Sube tu reel para recibir feedback personalizado de IA
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "upload" 
                      ? "bg-flow-electric text-white" 
                      : "bg-flow-electric/20 text-flow-electric"
                  }`}>
                    {uploadStep !== "upload" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <span className="ml-2 font-medium text-sm font-satoshi">Subir</span>
                </div>
                
                <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "processing" 
                      ? "bg-flow-electric text-white" 
                      : uploadStep === "complete" 
                        ? "bg-flow-electric/20 text-flow-electric" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {uploadStep === "complete" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className={`ml-2 font-medium text-sm font-satoshi ${
                    uploadStep === "upload" ? "text-muted-foreground" : ""
                  }`}>Procesando</span>
                </div>
                
                <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "complete" 
                      ? "bg-flow-electric text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span>3</span>
                  </div>
                  <span className={`ml-2 font-medium text-sm font-satoshi ${
                    uploadStep !== "complete" ? "text-muted-foreground" : ""
                  }`}>Completado</span>
                </div>
              </div>
            </div>
            
            {uploadStep === "upload" && (
              <VideoUploader onUploadComplete={handleUploadComplete} />
            )}
            
            {uploadStep === "processing" && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-flow-electric/10 mb-6">
                  <div className="w-8 h-8 border-4 border-t-flow-electric border-r-flow-electric border-b-flow-electric/30 border-l-flow-electric/30 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">PROCESANDO TU REEL</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-4 font-satoshi">
                  Nuestro modelo de IA está analizando tu video. Esto puede tomar unos minutos.
                </p>
                <div className="h-2 w-64 bg-muted rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-flow-electric rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}
            
            {uploadStep === "complete" && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">¡REEL PROCESADO CON ÉXITO!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 font-satoshi">
                  Tu video ha sido procesado y los resultados están listos para ser visualizados.
                </p>
                <button
                  onClick={handleContinue}
                  className="bg-flow-electric text-white hover:bg-flow-electric/90 px-6 py-3 rounded-md font-medium inline-flex items-center font-satoshi"
                >
                  Ver resultados
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

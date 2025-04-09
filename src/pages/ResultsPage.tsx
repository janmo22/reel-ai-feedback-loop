
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useVideoResults } from "@/hooks/use-video-results";
import VideoActions from "@/components/results/VideoActions";
import SuggestedCopy from "@/components/results/SuggestedCopy";
import ResultsFeedback from "@/components/results/ResultsFeedback";
import LoadingResults from "@/components/results/LoadingResults";
import NoResults from "@/components/results/NoResults";
import { useToast } from "@/components/ui/use-toast";

const ResultsPage = () => {
  const navigate = useNavigate();
  const { feedback, videoData, loading, hasFeedback } = useVideoResults();
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Análisis guardado",
      description: "El análisis se ha guardado correctamente."
    });
  };

  const handleShare = () => {
    toast({
      title: "Compartir resultados",
      description: "Funcionalidad de compartir en desarrollo."
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4 flex items-center justify-center">
          <LoadingResults />
        </main>
      </div>
    );
  }
  
  // Ensure feedback data is available
  if (!hasFeedback) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <NoResults />
          </div>
        </main>
      </div>
    );
  }
  
  // Get the first feedback item
  const feedbackItem = feedback![0];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            
            <h1 className="text-3xl font-bold mb-2 electric-text">RESULTADOS DEL ANÁLISIS</h1>
            {videoData && (
              <p className="text-xl font-medium">{videoData.title}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Actions sidebar */}
            <div className="md:col-span-1">
              <VideoActions onSave={handleSave} onShare={handleShare} />
            </div>
            
            {/* Main score and summary */}
            <div className="md:col-span-2">
              <ResultsFeedback feedbackItem={feedbackItem} />
            </div>
          </div>
          
          <SuggestedCopy 
            suggestedText={feedbackItem.seo.suggestedText}
            suggestedCopy={feedbackItem.seo.suggestedCopy}
          />
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;

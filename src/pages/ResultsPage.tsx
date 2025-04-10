
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Video } from "lucide-react";
import { useVideoResults } from "@/hooks/use-video-results";
import VideoActions from "@/components/results/VideoActions";
import SuggestedCopy from "@/components/results/SuggestedCopy";
import LoadingResults from "@/components/results/LoadingResults";
import NoResults from "@/components/results/NoResults";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/layout/Footer";
import ResultsFeedback from "@/components/results/ResultsFeedback";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProcessing = location.state?.videoData?.isProcessing === true;
  const { feedback, videoData, loading, hasFeedback, toggleFavorite, error } = useVideoResults();
  const { toast } = useToast();
  
  const handleShare = () => {
    toast({
      title: "Compartir resultados",
      description: "Funcionalidad de compartir en desarrollo."
    });
  };
  
  // Show loading screen if the video is currently being processed
  // or if we're still loading data
  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4 flex items-center justify-center">
          <LoadingResults />
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show error state if there was an error loading the data
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <NoResults />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Ensure feedback data is available
  if (!hasFeedback || !feedback || !videoData) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <NoResults />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get the first feedback item
  const feedbackItem = feedback[0];
  const fd = feedbackItem.feedback_data;
  
  // Determine content details
  const contentTitle = videoData.title || "Análisis de Reel";
  const contentType = fd?.contentTypeStrategy?.classification || feedbackItem.contentType || "Análisis de contenido";
  
  // Get overall score
  const score = feedbackItem.overallEvaluation?.score || 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">{contentType}</span>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-slate-800">
                  {contentTitle}
                </h1>
                {fd?.videoStructureAndPacing?.valueDelivery?.mainFunction && (
                  <div className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    Función: {fd.videoStructureAndPacing.valueDelivery.mainFunction}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  {[1, 2, 3, 4, 5].map((_, idx) => {
                    const halfScore = score / 2;
                    const filled = idx < Math.floor(halfScore);
                    const half = !filled && idx === Math.floor(halfScore) && halfScore % 1 !== 0;
                    
                    return (
                      <Star 
                        key={idx} 
                        className={`h-6 w-6 ${
                          filled ? 'text-amber-400 fill-amber-400' : 
                          half ? 'text-amber-400 fill-amber-400/50' : 
                          'text-amber-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-2xl font-bold text-slate-800">{score}/10</div>
                <div className="text-xs text-slate-500">Puntuación global</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <ResultsFeedback feedbackItem={feedbackItem} />
            </div>
            
            <div className="md:col-span-1">
              <div className="sticky top-24">
                <VideoActions 
                  onSave={toggleFavorite}
                  onShare={handleShare}
                  isFavorite={videoData.is_favorite}
                />
                
                {/* Sugerencias específicas de copy */}
                {fd?.seoAndDiscoverability?.suggestedOptimizedCopy && (
                  <SuggestedCopy 
                    suggestedText={fd.seoAndDiscoverability.suggestedOptimizedOnScreenText || ""}
                    suggestedCopy={fd.seoAndDiscoverability.suggestedOptimizedCopy || ""}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;

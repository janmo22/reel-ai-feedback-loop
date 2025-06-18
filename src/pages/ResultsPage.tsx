
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { useVideoResults } from "@/hooks/use-video-results";
import VideoActions from "@/components/results/VideoActions";
import LoadingResults from "@/components/results/LoadingResults";
import NoResults from "@/components/results/NoResults";
import { useToast } from "@/hooks/use-toast";
import ResultsFeedback from "@/components/results/ResultsFeedback";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  
  // Get videoId from either URL params or query parameters
  const searchParams = new URLSearchParams(location.search);
  const videoId = params.videoId || searchParams.get('videoId');
  
  console.log("ResultsPage - videoId from params:", params.videoId);
  console.log("ResultsPage - videoId from query:", searchParams.get('videoId'));
  console.log("ResultsPage - final videoId:", videoId);
  
  const isProcessing = location.state?.videoData?.isProcessing === true;
  const { feedback, videoData, loading, hasFeedback, toggleFavorite, error, unauthorized } = useVideoResults(videoId);
  const { toast } = useToast();
  
  console.log("ResultsPage render - loading:", loading, "hasFeedback:", hasFeedback, "isProcessing:", isProcessing);
  
  useEffect(() => {
    if (!loading && hasFeedback && isProcessing) {
      toast({
        title: "¡Análisis completado!",
        description: "Tu reel ha sido analizado correctamente y está listo para revisar."
      });
    }
  }, [loading, hasFeedback, isProcessing, toast]);
  
  const handleShare = () => {
    toast({
      title: "Compartir resultados",
      description: "Funcionalidad de compartir en desarrollo."
    });
  };
  
  // Redirect to correct URL format if needed
  useEffect(() => {
    if (videoId && !params.videoId && searchParams.get('videoId')) {
      // If we have videoId in query params but not in URL params, redirect
      navigate(`/results/${videoId}`, { replace: true, state: location.state });
    }
  }, [videoId, params.videoId, searchParams, navigate, location.state]);
  
  // Show loading screen if we're still loading data or if explicitly in processing state
  if (loading || (isProcessing && !hasFeedback)) {
    console.log("Showing loading screen");
    return (
      <main className="flex-1 py-8 px-4 flex items-center justify-center">
        <LoadingResults />
      </main>
    );
  }
  
  // Show error state if there was an error loading the data
  if (error || unauthorized) {
    console.log("Showing error state:", error);
    return (
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <NoResults error={error} />
        </div>
      </main>
    );
  }
  
  // Ensure feedback data is available and the video belongs to the current user
  if (!hasFeedback || !feedback || !videoData) {
    console.log("No feedback or video data available");
    return (
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <NoResults />
        </div>
      </main>
    );
  }
  
  console.log("Showing results with feedback");
  
  // Get the first feedback item
  const feedbackItem = feedback[0];
  const fd = feedbackItem.feedback_data;
  
  // Determine content details
  const contentTitle = videoData.title || "Análisis de Reel";
  const contentTypeValue = fd?.contentTypeStrategy?.classification || 
                          feedbackItem.contentType || 
                          "Análisis de contenido";
  
  const score = fd?.finalEvaluation?.overallScore || 
               feedbackItem.overallEvaluation?.score || 
               0;
  
  return (
    <main className="flex-1 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-slate-800">
                {contentTitle}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{contentTypeValue}</span>
                {fd?.videoStructureAndPacing?.valueDelivery?.mainFunction && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                    {fd.videoStructureAndPacing.valueDelivery.mainFunction}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((_, idx) => {
                  const halfScore = score / 2;
                  const filled = idx < Math.floor(halfScore);
                  const half = !filled && idx === Math.floor(halfScore) && halfScore % 1 !== 0;
                  
                  return (
                    <Star 
                      key={idx} 
                      className={`h-5 w-5 ${
                        filled ? 'text-blue-400 fill-blue-400' : 
                        half ? 'text-blue-400 fill-blue-400/50' : 
                        'text-blue-200'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="text-lg font-bold text-slate-800 ml-1">{score}/10</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <ResultsFeedback feedbackItem={feedbackItem} />
          
          <VideoActions 
            onSave={toggleFavorite}
            onShare={handleShare}
            isFavorite={videoData.is_favorite}
          />
        </div>
      </div>
    </main>
  );
};

export default ResultsPage;

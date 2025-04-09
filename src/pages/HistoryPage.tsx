
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import FeedbackCard from "@/components/FeedbackCard";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, HistoryIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const HistoryPage = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      
      try {
        // Fetch videos and join with feedback
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            feedback(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setVideos(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los videos: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [user, toast]);
  
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };
  
  const formatFeedbackForDisplay = (feedback: any) => {
    if (!feedback || !feedback.feedback_data) return [];
    
    const data = feedback.feedback_data;
    
    // Extract categories from the feedback data
    const categories = [];
    
    if (data.structure?.hook) {
      categories.push({
        name: "Hook",
        score: data.structure.hook.score || 0,
        feedback: data.structure.hook.general || "No hay información disponible",
      });
    }
    
    if (data.engagementPotential) {
      categories.push({
        name: "Engagement",
        score: data.overallEvaluation?.score || 0,
        feedback: data.engagementPotential.interaction || "No hay información disponible",
      });
    }
    
    if (data.seo) {
      categories.push({
        name: "SEO",
        score: 7,
        feedback: data.seo.keywordAnalysis || "No hay información disponible",
      });
    }
    
    return categories;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-flow-electric" />
            <p className="text-muted-foreground">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Historial de reels</h1>
            <p className="text-muted-foreground">
              Visualiza y gestiona tus reels subidos anteriormente
            </p>
          </div>
          
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  videoUrl={video.video_url}
                  date={video.created_at}
                  status={video.status}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<HistoryIcon className="h-12 w-12 text-muted-foreground" />}
              title="No hay historial de reels"
              description="Aún no has subido ningún reel para análisis. Comienza subiendo tu primer reel."
              actionLabel="Subir reel"
              actionLink="/upload"
            />
          )}
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedVideo && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                <p className="text-muted-foreground text-sm">
                  Subido el {new Date(selectedVideo.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  src={selectedVideo.video_url} 
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              
              {selectedVideo.status === "completed" && selectedVideo.feedback && selectedVideo.feedback.length > 0 && (
                <FeedbackCard
                  title="Análisis de IA"
                  overallScore={selectedVideo.feedback[0].overall_score || 0}
                  categories={formatFeedbackForDisplay(selectedVideo.feedback[0])}
                  isDetailed={true}
                />
              )}
              
              {selectedVideo.status === "processing" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                  <div className="mr-4">
                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-yellow-800">El análisis de este reel está en proceso. Por favor, vuelve más tarde.</p>
                </div>
              )}
              
              {selectedVideo.status === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <div className="mr-4 text-red-500">⚠️</div>
                  <div>
                    <p className="text-red-800 font-medium">Error en el procesamiento</p>
                    <p className="text-red-600 text-sm">Hubo un problema al analizar este reel. Intenta subirlo nuevamente.</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setDialogOpen(false)}
                >
                  Cerrar
                </Button>
                {selectedVideo.status === "completed" && selectedVideo.feedback && selectedVideo.feedback.length > 0 && (
                  <Button onClick={() => navigate("/results", { state: { 
                    feedback: [selectedVideo.feedback[0].feedback_data],
                    videoData: {
                      title: selectedVideo.title,
                      videoUrl: selectedVideo.video_url
                    }
                  }})}>
                    Ver informe completo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;

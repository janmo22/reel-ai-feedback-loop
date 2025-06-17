
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft, Clock, Bell, AlertTriangle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoadingResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('videoId');
  const [hasUserStrategy, setHasUserStrategy] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const MAX_CHECK_ATTEMPTS = 60;
  
  useEffect(() => {
    if (!videoId || !user) return;
    
    const checkUserStrategy = async () => {
      try {
        const { data, error } = await supabase
          .from('user_mission')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) throw error;
        
        setHasUserStrategy(data && data.length > 0);
      } catch (err) {
        console.error("Error checking user mission data:", err);
      }
    };
    
    checkUserStrategy();
    
    const checkVideoStatus = async () => {
      try {
        console.log(`Checking status for video: ${videoId}`);
        
        // Check video status
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('status')
          .eq('id', videoId)
          .single();
          
        if (videoError) {
          console.error("Error checking video status:", videoError);
          return;
        }
        
        console.log(`Video status: ${videoData.status}`);
        setVideoStatus(videoData.status);
        
        // If video is in error state
        if (videoData.status === 'error') {
          toast({
            title: "Error en el análisis",
            description: "Hubo un problema procesando tu video. Puedes intentar de nuevo más tarde.",
            variant: "destructive"
          });
          navigate('/history');
          return;
        }
        
        // Check if feedback exists
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('id')
          .eq('video_id', videoId)
          .limit(1);
          
        if (feedbackError) {
          console.error("Error checking feedback:", feedbackError);
          return;
        }
        
        console.log(`Feedback found: ${feedbackData?.length > 0}`);
        
        // If feedback exists, redirect to results
        if (feedbackData && feedbackData.length > 0) {
          console.log("Feedback found, redirecting to results");
          toast({
            title: "¡Análisis completado!",
            description: "Tu reel ha sido analizado correctamente.",
          });
          navigate(`/results?videoId=${videoId}`, { replace: true });
          return;
        }
        
        setCheckAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Check attempt: ${newAttempts}/${MAX_CHECK_ATTEMPTS}`);
          
          if (newAttempts >= MAX_CHECK_ATTEMPTS) {
            toast({
              title: "Timeout del análisis",
              description: "El análisis está tardando más de lo esperado. Por favor, revisa tu historial más tarde.",
              variant: "destructive"
            });
            navigate('/history');
          }
          
          return newAttempts;
        });
        
      } catch (err) {
        console.error("Error checking video status:", err);
      }
    };
    
    // Check initially
    checkVideoStatus();
    
    // Set up interval to check every 5 seconds
    const interval = setInterval(checkVideoStatus, 5000);
    
    // Set up real-time subscription
    const channel = supabase
      .channel('processing-updates')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'feedback', filter: `video_id=eq.${videoId}` },
          (payload) => {
            console.log('New feedback detected via realtime:', payload);
            clearInterval(interval);
            toast({
              title: "¡Análisis completado!",
              description: "Tu reel ha sido analizado correctamente.",
            });
            navigate(`/results?videoId=${videoId}`, { replace: true });
          }
      )
      .subscribe();
      
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [videoId, navigate, toast, user]);
  
  if (videoStatus === 'error') {
    return (
      <div className="w-full h-full flex items-center justify-center py-16">
        <EmptyState 
          icon={<AlertTriangle className="h-12 w-12 text-red-500" />}
          title="Error en el análisis"
          description="Hubo un problema procesando tu video. Puedes intentar de nuevo más tarde."
          actionText="Volver al historial"
          onAction={() => navigate('/history')}
          actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <EmptyState 
        icon={<Loader className="h-12 w-12 animate-spin text-flow-electric" />}
        title="Analizando tu reel"
        description={
          <div className="space-y-4">
            <p>
              Estamos procesando tu reel con inteligencia artificial. Este proceso 
              suele tardar aproximadamente <strong>2 minutos</strong>.
            </p>
            {hasUserStrategy && (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Bell className="h-5 w-5" />
                <p className="font-medium">Tu estrategia de contenido se está utilizando para personalizar el análisis.</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Clock className="h-5 w-5" />
              <p className="font-medium">
                Verificando progreso... (Intento {checkAttempts}/{60})
              </p>
            </div>
            {checkAttempts > 30 && (
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">El análisis está tardando más de lo esperado, pero sigue en proceso...</p>
              </div>
            )}
          </div>
        }
        actionText="Ver historial de videos"
        onAction={() => navigate('/history')}
        actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
      />
    </div>
  );
};

export default LoadingResults;

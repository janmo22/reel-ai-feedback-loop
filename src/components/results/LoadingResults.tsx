
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft, Clock, Bell } from "lucide-react";
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
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // If no videoId is provided, we can't check for results
    if (!videoId || !user) return;
    
    // Check initially if feedback already exists
    const checkFeedbackExists = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id')
          .eq('video_id', videoId)
          .limit(1);
          
        if (error) throw error;
        
        // If feedback exists, set ready state to true
        if (data && data.length > 0) {
          setIsReady(true);
          toast({
            title: "¡Análisis completado!",
            description: "Tu reel ha sido analizado correctamente.",
          });
          // Wait a moment before redirecting to ensure the toast is seen
          setTimeout(() => {
            navigate(`/results?videoId=${videoId}`, { replace: true });
          }, 1500);
        }
      } catch (err) {
        console.error("Error checking feedback:", err);
      }
    };
    
    checkFeedbackExists();
    
    // Set up real-time subscription to feedback table
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'feedback', filter: `video_id=eq.${videoId}` },
          (payload) => {
            console.log('New feedback received:', payload);
            setIsReady(true);
            toast({
              title: "¡Análisis completado!",
              description: "Tu reel ha sido analizado correctamente.",
            });
            // Wait a moment before redirecting to ensure the toast is seen
            setTimeout(() => {
              navigate(`/results?videoId=${videoId}`, { replace: true });
            }, 1500);
          }
      )
      .subscribe();
      
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, navigate, toast, user]);
  
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <EmptyState 
        icon={<Loader className="h-12 w-12 animate-spin text-flow-electric" />}
        title="Analizando tu reel"
        description={
          <div className="space-y-4">
            <p>
              Estamos procesando tu reel con inteligencia artificial. Este proceso 
              suele tardar aproximadamente <strong>2 minutos</strong> y ocurre en segundo plano.
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Clock className="h-5 w-5" />
              <p className="font-medium">Puedes cerrar esta ventana y consultar los resultados más tarde en tu historial.</p>
            </div>
            <p className="text-muted-foreground italic">
              La página se actualizará automáticamente cuando el análisis esté listo.
            </p>
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

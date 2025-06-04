
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
  const [hasUserStrategy, setHasUserStrategy] = useState(false);
  
  useEffect(() => {
    // If no videoId is provided, we can't check for results
    if (!videoId || !user) return;
    
    // Check if user has strategy data
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
    
    // Check initially if feedback already exists
    const checkFeedbackExists = async () => {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('id')
          .eq('video_id', videoId)
          .limit(1);
          
        if (error) throw error;
        
        // If feedback exists, redirect to results
        if (data && data.length > 0) {
          toast({
            title: "¡Análisis completado!",
            description: "Tu reel ha sido analizado correctamente.",
          });
          navigate(`/results?videoId=${videoId}`, { replace: true });
        }
      } catch (err) {
        console.error("Error checking feedback:", err);
      }
    };
    
    checkFeedbackExists();
    
    // Set up real-time subscription to feedback table
    const channel = supabase
      .channel('processing-updates')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'feedback', filter: `video_id=eq.${videoId}` },
          (payload) => {
            console.log('New feedback detected:', payload);
            toast({
              title: "¡Análisis completado!",
              description: "Tu reel ha sido analizado correctamente.",
            });
            // Navigate to results
            navigate(`/results?videoId=${videoId}`, { replace: true });
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
              <p className="font-medium">La página se actualizará automáticamente cuando esté listo.</p>
            </div>
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

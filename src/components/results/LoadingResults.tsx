
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft, Clock, Bell, CheckCircle, AlertCircle } from "lucide-react";
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
  const [hasUserStrategy, setHasUserStrategy] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'uploading' | 'processing' | 'analyzing' | 'completed' | 'error'>('uploading');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Iniciando análisis...');
  
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
        
        // Set flag if user has strategy data
        setHasUserStrategy(data && data.length > 0);
      } catch (err) {
        console.error("Error checking user mission data:", err);
      }
    };
    
    checkUserStrategy();
    
    // Check video status and update progress accordingly
    const checkVideoStatus = async () => {
      try {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('status')
          .eq('id', videoId)
          .single();
          
        if (videoError) throw videoError;
        
        if (videoData) {
          const status = videoData.status;
          console.log('Current video status:', status);
          
          switch (status) {
            case 'processing':
              setCurrentStatus('processing');
              setProgress(25);
              setStatusMessage('Video subido, iniciando procesamiento con IA...');
              break;
            case 'completed':
              setCurrentStatus('completed');
              setProgress(100);
              setStatusMessage('¡Análisis completado!');
              setIsReady(true);
              break;
            case 'error':
              setCurrentStatus('error');
              setProgress(0);
              setStatusMessage('Error en el procesamiento');
              break;
            default:
              setCurrentStatus('uploading');
              setProgress(10);
              setStatusMessage('Preparando video...');
          }
        }
      } catch (err) {
        console.error("Error checking video status:", err);
        setCurrentStatus('error');
        setStatusMessage('Error al verificar el estado');
      }
    };
    
    // Check initially
    checkVideoStatus();
    
    // Check if feedback already exists
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
          setCurrentStatus('completed');
          setProgress(100);
          setStatusMessage('¡Análisis completado!');
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
            setCurrentStatus('completed');
            setProgress(100);
            setStatusMessage('¡Análisis completado!');
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
      .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'videos', filter: `id=eq.${videoId}` },
          (payload) => {
            console.log('Video status updated:', payload);
            const newRecord = payload.new as any;
            
            switch (newRecord.status) {
              case 'processing':
                setCurrentStatus('processing');
                setProgress(50);
                setStatusMessage('Analizando video con IA...');
                break;
              case 'completed':
                setCurrentStatus('completed');
                setProgress(100);
                setStatusMessage('¡Análisis completado!');
                break;
              case 'error':
                setCurrentStatus('error');
                setProgress(0);
                setStatusMessage('Error en el procesamiento');
                toast({
                  title: "Error en el procesamiento",
                  description: "Hubo un problema al analizar tu video. Por favor, inténtalo de nuevo.",
                  variant: "destructive"
                });
                break;
            }
          }
      )
      .subscribe();
      
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId, navigate, toast, user]);

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Loader className="h-12 w-12 animate-spin text-flow-electric" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-flow-electric';
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <EmptyState 
        icon={getStatusIcon()}
        title={currentStatus === 'completed' ? '¡Análisis completado!' : 
               currentStatus === 'error' ? 'Error en el análisis' : 
               'Analizando tu reel'}
        description={
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${getStatusColor()}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Status message */}
            <p className="font-medium text-lg">
              {statusMessage}
            </p>

            {currentStatus !== 'error' && currentStatus !== 'completed' && (
              <p className="text-muted-foreground">
                Estamos procesando tu reel con inteligencia artificial. Este proceso 
                suele tardar aproximadamente <strong>2 minutos</strong>.
              </p>
            )}
            
            {hasUserStrategy && currentStatus !== 'error' && (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Bell className="h-5 w-5" />
                <p className="font-medium">Tu estrategia de contenido se está utilizando para personalizar el análisis.</p>
              </div>
            )}
            
            {currentStatus !== 'error' && currentStatus !== 'completed' && (
              <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                <Clock className="h-5 w-5" />
                <p className="font-medium">Puedes cerrar esta ventana y consultar los resultados más tarde en tu historial.</p>
              </div>
            )}

            {currentStatus === 'error' && (
              <p className="text-red-600">
                Hubo un problema al procesar tu video. Por favor, inténtalo de nuevo más tarde.
              </p>
            )}
            
            {currentStatus !== 'error' && currentStatus !== 'completed' && (
              <p className="text-muted-foreground italic">
                La página se actualizará automáticamente cuando el análisis esté listo.
              </p>
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

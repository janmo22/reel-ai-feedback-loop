
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowRight, Clock, History, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProcessingStepsProps {
  currentStep: "processing" | "complete";
  loadingPhrase: string;
  onContinue: () => void;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({
  currentStep,
  loadingPhrase,
  onContinue,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('videoId');
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const [estimatedTime, setEstimatedTime] = useState<number>(180); // 3 minutes default
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('Iniciando análisis...');
  
  useEffect(() => {
    // Timer for elapsed time
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Update progress messages based on time
        if (newTime < 30) {
          setProgressMessage('Subiendo video a la nube...');
        } else if (newTime < 60) {
          setProgressMessage('Preparando análisis con IA...');
        } else if (newTime < 120) {
          setProgressMessage('Analizando contenido del video...');
        } else if (newTime < 180) {
          setProgressMessage('Generando recomendaciones personalizadas...');
        } else {
          setProgressMessage('Finalizando análisis, casi listo...');
          // Extend estimated time for large files
          setEstimatedTime(prev => Math.max(prev, newTime + 60));
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentStep !== "processing" || !videoId || !user) return;
    
    console.log('Setting up enhanced real-time feedback listener for video:', videoId);
    
    // Set up real-time subscription to feedback table
    const channel = supabase
      .channel('processing-updates')
      .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'feedback', 
            filter: `video_id=eq.${videoId}` 
          },
          (payload) => {
            console.log('New feedback detected:', payload);
            setProcessingStatus('completed');
            setProgressMessage('¡Análisis completado!');
            toast({
              title: "¡Análisis completado! 🎉",
              description: "Tu reel ha sido analizado correctamente y ya puedes ver los resultados.",
            });
            onContinue();
          }
      )
      .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public', 
            table: 'videos',
            filter: `id=eq.${videoId}`
          },
          (payload) => {
            console.log('Video status updated:', payload);
            const newRecord = payload.new as any;
            if (newRecord.status === 'error') {
              setProcessingStatus('error');
              setProgressMessage('Error en el procesamiento');
              toast({
                title: "Error en el procesamiento",
                description: "Hubo un problema al analizar tu video. Puedes intentar de nuevo.",
                variant: "destructive"
              });
            } else if (newRecord.status === 'completed') {
              setProcessingStatus('completed');
              setProgressMessage('¡Análisis completado!');
              toast({
                title: "¡Análisis completado! 🎉", 
                description: "Tu reel ha sido analizado correctamente.",
              });
              onContinue();
            }
          }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentStep, videoId, toast, onContinue, user]);

  // Enhanced status checking with better intervals
  useEffect(() => {
    if (!videoId || currentStep !== "processing") return;

    const checkStatus = async () => {
      try {
        // Check if feedback exists
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('video_id', videoId)
          .maybeSingle();

        if (feedbackError) {
          console.error('Error checking feedback:', feedbackError);
          return;
        }

        if (feedback) {
          console.log('Feedback found via polling, analysis completed');
          setProcessingStatus('completed');
          setProgressMessage('¡Análisis completado!');
          onContinue();
          return;
        }

        // Check video status
        const { data: video, error: videoError } = await supabase
          .from('videos')
          .select('status')
          .eq('id', videoId)
          .single();

        if (videoError) {
          console.error('Error checking video status:', videoError);
          return;
        }

        if (video.status === 'error') {
          setProcessingStatus('error');
          setProgressMessage('Error en el procesamiento');
        } else if (video.status === 'completed') {
          setProcessingStatus('completed');
          setProgressMessage('¡Análisis completado!');
          onContinue();
        }
      } catch (error) {
        console.error('Error in status check:', error);
      }
    };

    // Check immediately and then with progressive intervals
    checkStatus();
    
    // Dynamic interval based on elapsed time
    const getCheckInterval = () => {
      if (timeElapsed < 60) return 5000; // 5s for first minute
      if (timeElapsed < 180) return 10000; // 10s for next 2 minutes
      return 15000; // 15s after 3 minutes
    };
    
    const statusCheck = setInterval(checkStatus, getCheckInterval());

    return () => clearInterval(statusCheck);
  }, [videoId, currentStep, onContinue, timeElapsed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (processingStatus === 'completed') return 100;
    if (processingStatus === 'error') return 0;
    
    // Smarter progress calculation
    const baseProgress = Math.min((timeElapsed / estimatedTime) * 85, 85); // Cap at 85% until actually complete
    
    // Add bonus progress for different stages
    if (timeElapsed > 30) baseProgress + 5; // Upload complete
    if (timeElapsed > 90) baseProgress + 5; // Analysis started
    if (timeElapsed > 150) baseProgress + 5; // Almost done
    
    return Math.min(baseProgress, 95);
  };

  const handleRetry = async () => {
    if (!videoId) return;
    
    setRetryCount(prev => prev + 1);
    setProcessingStatus('processing');
    setTimeElapsed(0);
    setProgressMessage('Reintentando análisis...');
    
    try {
      // Reset video status to trigger reprocessing
      await supabase
        .from('videos')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', videoId);
        
      toast({
        title: "Reintentando análisis",
        description: "Hemos reiniciado el proceso de análisis de tu video.",
      });
    } catch (error) {
      console.error('Error retrying:', error);
      toast({
        title: "Error al reintentar",
        description: "No se pudo reiniciar el análisis. Intenta subir el video nuevamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-8 text-center flex flex-col items-center space-y-6 shadow-lg border-border/40">
      <div className="relative">
        {processingStatus === 'processing' ? (
          <div className="w-20 h-20 rounded-full bg-flow-electric/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-flow-electric animate-spin" />
          </div>
        ) : processingStatus === 'error' ? (
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        )}
      </div>

      <div className="space-y-3 max-w-lg">
        <h2 className="text-2xl font-bold">
          {processingStatus === 'processing' ? "Analizando tu reel con IA" : 
           processingStatus === 'error' ? "Error en el procesamiento" :
           "¡Análisis completado!"}
        </h2>
        
        <p className="text-muted-foreground font-satoshi">
          {processingStatus === 'processing' ? (
            <>
              {progressMessage}
              <span className="inline-block animate-pulse">...</span>
            </>
          ) : processingStatus === 'error' ? (
            "Hubo un problema al procesar tu video. Puedes intentar de nuevo o contactar soporte si el problema persiste."
          ) : (
            "Tu reel ha sido analizado con éxito. Ahora puedes ver los resultados detallados y las recomendaciones personalizadas."
          )}
        </p>
      </div>

      {/* Enhanced progress bar for processing */}
      {processingStatus === 'processing' && (
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso del análisis</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-flow-electric h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tiempo: {formatTime(timeElapsed)}</span>
            <span>Estimado: {formatTime(estimatedTime)}</span>
          </div>
        </div>
      )}

      {(processingStatus === 'completed' || currentStep === "complete") && (
        <Button 
          onClick={onContinue}
          className="mt-4 bg-flow-electric hover:bg-flow-electric/90 text-white px-6 py-2"
        >
          Ver resultados detallados
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      {processingStatus === 'error' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleRetry}
              className="bg-flow-electric hover:bg-flow-electric/90 text-white px-6 py-2"
              disabled={retryCount >= 2}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {retryCount >= 2 ? 'Máximo de intentos' : 'Reintentar análisis'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/upload')}
              className="px-6 py-2"
            >
              Subir otro video
            </Button>
          </div>
          {retryCount >= 2 && (
            <p className="text-sm text-muted-foreground">
              Si el problema persiste, puedes intentar con un video más pequeño o contactar soporte.
            </p>
          )}
        </div>
      )}
      
      {processingStatus === 'processing' && (
        <div className="space-y-4 text-sm max-w-lg">
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <Clock className="h-5 w-5 flex-shrink-0" />
            <p className="text-left">
              El análisis con IA está en proceso. <strong>Tiempo estimado: 2-4 minutos</strong>. 
              Los videos más grandes pueden tardar un poco más. Te notificaremos automáticamente cuando esté listo.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/history')}
            className="inline-flex items-center"
          >
            <History className="mr-2 h-4 w-4" />
            Ver historial de videos
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProcessingSteps;

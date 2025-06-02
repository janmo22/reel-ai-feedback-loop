
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowRight, Clock, History, AlertCircle } from "lucide-react";
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
  const [estimatedTime, setEstimatedTime] = useState<number>(120); // 2 minutes in seconds
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
  useEffect(() => {
    // Timer for elapsed time
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Only set up listener if we're on the processing step and we have a videoId
    if (currentStep !== "processing" || !videoId || !user) return;
    
    console.log('Setting up real-time feedback listener for video:', videoId);
    
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
            toast({
              title: "¡Análisis completado! 🎉",
              description: "Tu reel ha sido analizado correctamente y ya puedes ver los resultados.",
            });
            // Call the onContinue function to update the UI
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
              toast({
                title: "Error en el procesamiento",
                description: "Hubo un problema al analizar tu video. Por favor, inténtalo de nuevo.",
                variant: "destructive"
              });
            } else if (newRecord.status === 'completed' && newRecord.feedback_received) {
              setProcessingStatus('completed');
              toast({
                title: "¡Análisis completado! 🎉", 
                description: "Tu reel ha sido analizado correctamente.",
              });
              onContinue();
            }
          }
      )
      .subscribe();
      
    // Cleanup subscription on component unmount or step change
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentStep, videoId, toast, onContinue, user]);

  // Check status periodically as backup
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
        } else if (video.status === 'completed') {
          setProcessingStatus('completed');
          onContinue();
        }
      } catch (error) {
        console.error('Error in status check:', error);
      }
    };

    // Check immediately and then every 10 seconds
    checkStatus();
    const statusCheck = setInterval(checkStatus, 10000);

    return () => clearInterval(statusCheck);
  }, [videoId, currentStep, onContinue]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (processingStatus === 'completed') return 100;
    if (processingStatus === 'error') return 0;
    return Math.min((timeElapsed / estimatedTime) * 100, 95); // Cap at 95% until actually complete
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
              {loadingPhrase}
              <span className="inline-block animate-pulse">...</span>
            </>
          ) : processingStatus === 'error' ? (
            "Hubo un problema al procesar tu video. Por favor, inténtalo de nuevo o contacta soporte si el problema persiste."
          ) : (
            "Tu reel ha sido analizado con éxito. Ahora puedes ver los resultados detallados y las recomendaciones personalizadas."
          )}
        </p>
      </div>

      {/* Progress bar for processing */}
      {processingStatus === 'processing' && (
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progreso estimado</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-flow-electric h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Tiempo transcurrido: {formatTime(timeElapsed)}</span>
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
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-flow-electric hover:bg-flow-electric/90 text-white px-6 py-2"
          >
            Intentar de nuevo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      {processingStatus === 'processing' && (
        <div className="space-y-4 text-sm max-w-lg">
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <Clock className="h-5 w-5 flex-shrink-0" />
            <p className="text-left">
              El análisis con IA está en proceso. <strong>Tiempo estimado: 2-3 minutos</strong>. 
              Te notificaremos automáticamente cuando esté listo.
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

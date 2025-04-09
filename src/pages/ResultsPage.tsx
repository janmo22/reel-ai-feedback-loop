
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import FeedbackCard from "@/components/FeedbackCard";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";
import AIFeedbackCard from "@/components/AIFeedbackCard";
import EmptyState from "@/components/EmptyState";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Definición de la estructura de datos del feedback de la IA
interface AIFeedbackResponse {
  generalStudy: string;
  contentType: string;
  engagementPotential: {
    interaction: string;
    watchTime: string;
  };
  nativeCodes: string;
  overallEvaluation: {
    score: number;
    suggestions: string[];
  };
  seo: {
    keywordAnalysis: string;
    suggestedCopy: string;
    suggestedText: string;
    clarity: string;
  };
  structure: {
    hook: {
      general: string;
      spoken: string;
      auditory: string;
      visual: string;
      clarity: string;
      feel: string;
      invitation: string;
      patternBreak: string;
      strengths: string;
      weaknesses: string;
      score: number;
    };
    buildUp: string;
    value: {
      comment: string;
      score: number;
      function: string;
    };
    cta: string;
  };
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Verificamos si tenemos datos del state
    const state = location.state;
    
    if (state && state.feedback) {
      // Si ya tenemos feedback en el state, lo usamos directamente
      setFeedback(state.feedback);
      setVideoData(state.videoData);
      setLoading(false);
      console.log("Usando datos de feedback del state:", state.feedback);
    } else if (state && state.videoId) {
      // Si solo tenemos el videoId, intentamos obtener los datos de la base de datos
      const fetchVideoData = async () => {
        try {
          // Obtenemos los datos del video
          const { data: videoData, error: videoError } = await supabase
            .from('videos')
            .select('*')
            .eq('id', state.videoId)
            .single();
          
          if (videoError) throw videoError;
          
          setVideoData(videoData);
          
          // Verificamos si el video está completado
          if (videoData.status === "completed") {
            // Buscamos el feedback asociado
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('feedback')
              .select('*')
              .eq('video_id', state.videoId)
              .single();
            
            if (feedbackError) {
              console.error("Error obteniendo feedback:", feedbackError);
              // No mostramos error, simplemente dejamos loading en true
            } else if (feedbackData) {
              // Convertimos los datos de feedback al formato esperado
              const formattedFeedback = [feedbackData.feedback_data];
              setFeedback(formattedFeedback);
              setLoading(false);
              console.log("Datos de feedback obtenidos de la BD:", formattedFeedback);
            }
          } else {
            // El video aún está en procesamiento
            setLoading(true);
            toast({
              title: "Video en procesamiento",
              description: "El análisis de este video aún está en proceso. Por favor, intenta más tarde.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error obteniendo datos:", error);
          setLoading(true);
        }
      };
      
      fetchVideoData();
    } else {
      // Si no tenemos datos en el state, mantenemos el estado de carga
      setLoading(true);
    }
  }, [location, toast]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4 flex items-center justify-center">
          <EmptyState 
            icon={<Loader className="h-6 w-6 animate-spin text-flow-blue" />}
            title="Esperando resultados"
            description="Estamos a la espera de recibir el análisis de tu reel. Por favor, regresa a la página de carga o intenta más tarde."
            actionText="Volver a subida"
            onAction={() => navigate('/upload')}
            actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
          />
        </main>
      </div>
    );
  }
  
  // Ensure feedback data is available
  if (!feedback || feedback.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No se encontraron resultados</h2>
              <p className="text-muted-foreground mb-6">No pudimos encontrar los resultados para este video.</p>
              <Button onClick={() => navigate('/upload')}>Volver</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Get the first feedback item
  const feedbackItem = feedback[0];
  
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
            {/* Quitamos la previsualización del video y mostramos acciones */}
            <div className="md:col-span-1">
              <div className="bg-muted/30 rounded-lg p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">Acciones</h3>
                <div className="flex flex-col space-y-3">
                  <Button className="w-full">
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Guardar análisis
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir resultados
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/upload')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a subir
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Main score and summary */}
            <div className="md:col-span-2">
              <AIFeedbackCard feedback={feedbackItem} />
              
              {/* Convert categories from feedbackItem to the format expected by FeedbackCard */}
              <div className="mt-6 space-y-6">
                <FeedbackCard
                  title="Evaluación del Hook"
                  overallScore={feedbackItem.structure.hook.score}
                  categories={[
                    {
                      name: "General",
                      score: feedbackItem.structure.hook.score,
                      feedback: feedbackItem.structure.hook.general
                    },
                    {
                      name: "Verbal",
                      score: feedbackItem.structure.hook.score,
                      feedback: feedbackItem.structure.hook.spoken
                    },
                    {
                      name: "Visual",
                      score: feedbackItem.structure.hook.score,
                      feedback: feedbackItem.structure.hook.visual
                    },
                    {
                      name: "Fortalezas y Debilidades",
                      score: feedbackItem.structure.hook.score,
                      feedback: `Fortalezas: ${feedbackItem.structure.hook.strengths}. Debilidades: ${feedbackItem.structure.hook.weaknesses}.`
                    }
                  ]}
                />
                
                <FeedbackCard
                  title="Evaluación de Valor y Estructura"
                  overallScore={feedbackItem.structure.value.score}
                  categories={[
                    {
                      name: "Valor principal",
                      score: feedbackItem.structure.value.score,
                      feedback: feedbackItem.structure.value.comment,
                      suggestions: [`Función: ${feedbackItem.structure.value.function}`]
                    },
                    {
                      name: "Desarrollo",
                      score: 7,
                      feedback: feedbackItem.structure.buildUp
                    },
                    {
                      name: "Call to Action (CTA)",
                      score: 6,
                      feedback: feedbackItem.structure.cta
                    }
                  ]}
                />
                
                <FeedbackCard
                  title="SEO y Códigos Nativos"
                  overallScore={7}
                  categories={[
                    {
                      name: "Análisis de palabras clave",
                      score: 7,
                      feedback: feedbackItem.seo.keywordAnalysis
                    },
                    {
                      name: "Claridad temática",
                      score: 8,
                      feedback: feedbackItem.seo.clarity
                    },
                    {
                      name: "Códigos nativos",
                      score: 7,
                      feedback: feedbackItem.nativeCodes
                    }
                  ]}
                />
                
                <FeedbackCard
                  title="Potencial de Engagement"
                  overallScore={7}
                  categories={[
                    {
                      name: "Interacción",
                      score: 7,
                      feedback: feedbackItem.engagementPotential.interaction
                    },
                    {
                      name: "Tiempo de visualización",
                      score: 7,
                      feedback: feedbackItem.engagementPotential.watchTime
                    }
                  ]}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">Copia sugerida para publicación</h3>
            <div className="bg-white p-4 rounded-md border mb-4 dark:bg-sidebar-accent">
              <p className="font-medium text-lg mb-2">{feedbackItem.seo.suggestedText}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{feedbackItem.seo.suggestedCopy}</p>
            </div>
            <Button>Copiar texto</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;

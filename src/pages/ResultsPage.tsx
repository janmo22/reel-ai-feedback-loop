
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import FeedbackCard from "@/components/FeedbackCard";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";
import AIFeedbackCard from "@/components/AIFeedbackCard";

// Sample data structure that would come from the webhook
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
  
  useEffect(() => {
    // In a real app, this data would come from the location state or API
    // For now, we'll simulate getting it from the location state
    const state = location.state;
    
    if (state && state.feedback) {
      setFeedback(state.feedback);
      setVideoData(state.videoData);
    } else {
      // For demo purposes, load sample data if none is provided
      const sampleFeedback = [
        {
          "generalStudy": "El video explica cómo usar eficientemente los diferentes modelos de ChatGPT para mejorar la productividad. Se centra en la elección del modelo adecuado según la tarea, dividiéndolos en dos grupos: los que razonan y los que no.",
          "contentType": "Content Series",
          "engagementPotential": {
            "interaction": "El video invita a la interacción al plantear una pregunta inicial sobre el uso de ChatGPT. Además, anima a guardar el video para futuras consultas, lo que incrementa el potencial de \"saves\".  La temática es relevante para una audiencia amplia interesada en productividad y tecnología.",
            "watchTime": "El dinamismo del presentador, los ejemplos prácticos y la promesa de valor (\"usar bien ChatGPT\") contribuyen a un buen potencial de watch time. La duración del video es adecuada para el formato corto de redes sociales."
          },
          "nativeCodes": "El video utiliza texto en pantalla, cambios de ritmo y un estilo de edición dinámico, propio de las plataformas como TikTok e Instagram. La inclusión de un dibujo animado en el hook es un elemento nativo que funciona bien. El uso de la pantalla del móvil y del ordenador también se adapta al formato.",
          "overallEvaluation": {
            "score": 7,
            "suggestions": [
              "Incluir una CTA más específica al final, como invitar a seguir al creador para más consejos de productividad.",
              "Mostrar ejemplos concretos de cómo usar cada modelo de ChatGPT en situaciones cotidianas.",
              "Añadir subtítulos para mejorar la accesibilidad y el engagement en usuarios que ven videos sin sonido."
            ]
          },
          "seo": {
            "keywordAnalysis": "El video utiliza palabras clave relevantes como ChatGPT, productividad, IA, modelos de lenguaje, optimización, etc. Se podrían reforzar con sinónimos y términos relacionados.",
            "suggestedCopy": "Aprende a usar ChatGPT como un PRO y dispara tu productividad. Descubre los diferentes modelos y elige el perfecto para cada tarea. #ChatGPT #Productividad #IA #InteligenciaArtificial #Tecnología #Emprendimiento #Consejos",
            "suggestedText": "Domina ChatGPT",
            "clarity": "La temática del video es clara tanto para los algoritmos como para los usuarios. El título y la descripción refuerzan el tema principal."
          },
          "structure": {
            "hook": {
              "general": "El hook es efectivo al plantear un problema común en el uso de ChatGPT y prometer una solución.",
              "spoken": "El presentador plantea una pregunta directa y genera curiosidad sobre cómo usar correctamente ChatGPT.",
              "auditory": "El inicio del video utiliza la voz del presentador para plantear una pregunta directa al usuario, lo que capta la atención.",
              "visual": "El hook visual muestra la interfaz de ChatGPT y al presentador hablando a cámara. La inclusión del dibujo animado añade un toque original.",
              "clarity": "El mensaje del hook es claro y conciso: si no cambias el modelo de ChatGPT, lo estás usando mal.",
              "feel": "El hook se siente natural y no forzado. La entonación del presentador transmite interés y cercanía.",
              "invitation": "El hook invita a seguir viendo al prometer revelar información valiosa sobre cómo usar correctamente la herramienta.",
              "patternBreak": "El video utiliza la ruptura de patrón al mostrar la pantalla de ChatGPT y luego al presentador con un dibujo. Esto crea dinamismo y ayuda a mantener la atención.",
              "strengths": "Claridad del mensaje, dinamismo visual, uso de preguntas directas.",
              "weaknesses": "Se podría mejorar la calidad de la imagen y la iluminación.",
              "score": 8
            },
            "buildUp": "El video mantiene el interés al presentar la información de forma organizada y con ejemplos visuales. La analogía de la maratón y los zapatos ayuda a comprender la importancia de elegir el modelo correcto.",
            "value": {
              "comment": "El valor principal del video es la explicación clara y concisa de los diferentes modelos de ChatGPT y su uso. La información es relevante para cualquier persona que utilice la herramienta.",
              "score": 8,
              "function": "Educar"
            },
            "cta": "La CTA es guardar el video para referencia futura, lo cual es útil para el usuario. Sin embargo, se podría complementar con una CTA más orientada a la interacción, como seguir al creador o dejar un comentario con su modelo favorito de ChatGPT."
          }
        }
      ];
      setFeedback(sampleFeedback);
      setVideoData({
        title: "Cómo usar ChatGPT correctamente",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      });
    }
    
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [location]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-flow-electric border-r-flow-electric border-b-flow-electric/30 border-l-flow-electric/30 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold">Cargando resultados...</h2>
          </div>
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
              <Button onClick={() => navigate(-1)}>Volver</Button>
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
            {/* Video preview */}
            <div className="md:col-span-1">
              {videoData && videoData.videoUrl ? (
                <div className="rounded-lg overflow-hidden aspect-[9/16] bg-black">
                  <video 
                    src={videoData.videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-lg bg-muted aspect-[9/16] flex items-center justify-center">
                  <p className="text-muted-foreground">Vista previa no disponible</p>
                </div>
              )}
              
              <div className="mt-4 flex flex-col space-y-2">
                <Button className="w-full">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Guardar análisis
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir resultados
                </Button>
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
            <div className="bg-white p-4 rounded-md border mb-4">
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

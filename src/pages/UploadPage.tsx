
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUploader from "@/components/video-upload/VideoUploader";
import ProgressSteps from "@/components/video-upload/ProgressSteps";
import ProcessingSteps from "@/components/video-upload/ProcessingSteps";
import { useToast } from "@/components/ui/use-toast";

// Frases divertidas para mostrar durante la carga
const funnyLoadingPhrases = [
  "La IA está analizando tu contenido píxel a píxel...",
  "Enseñando a nuestros robots a apreciar tu creatividad...",
  "Calculando el potencial viral de tu reel...",
  "Aplicando magia de inteligencia artificial...",
  "Convirtiendo algoritmos en insights útiles...",
  "Nuestra IA está impresionada con tu contenido...",
  "Analizando métricas que ni sabías que existían...",
  "Preparando feedback que te sorprenderá...",
  "Entrenando a tu audiencia virtual para reaccionar...",
  "Haciendo que los algoritmos trabajen para ti...",
  "Transformando datos en estrategia de contenido...",
  "Descifrando el código del engagement perfecto...",
];

const UploadPage = () => {
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");
  const [uploadData, setUploadData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [processingTimer, setProcessingTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rotamos las frases divertidas cada 5 segundos durante el procesamiento
  useEffect(() => {
    if (uploadStep === "processing") {
      // Seleccionar frase inicial
      setLoadingPhrase(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
      
      // Configurar intervalo para cambiar la frase
      const phraseInterval = setInterval(() => {
        setLoadingPhrase(funnyLoadingPhrases[Math.floor(Math.random() * funnyLoadingPhrases.length)]);
      }, 5000);
      
      return () => {
        clearInterval(phraseInterval);
      };
    }
  }, [uploadStep]);
  
  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (processingTimer) clearTimeout(processingTimer);
    };
  }, [processingTimer]);
  
  const handleUploadComplete = (data: any) => {
    setUploadData(data);
    setUploadStep("processing");
    
    console.log("Información enviada correctamente, procesando análisis...");
    
    // En un escenario real, la respuesta del webhook debería activar un cambio de estado
    // Por ahora, simulamos el tiempo de procesamiento para la demo
    
    // Simulación del tiempo de procesamiento (60 segundos)
    const timer = setTimeout(() => {
      // Simular que el webhook devuelve datos de análisis
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
      
      setFeedbackData(sampleFeedback);
      setUploadStep("complete");
      
      toast({
        title: "¡Análisis completado!",
        description: "El análisis de tu reel ha sido completado con éxito.",
      });
      
    }, 60000);
    
    setProcessingTimer(timer);
  };
  
  const handleContinue = () => {
    // Solo navegamos a la página de resultados si realmente tenemos datos de feedback
    if (feedbackData) {
      navigate("/results", { 
        state: { 
          feedback: feedbackData,
          videoData: {
            title: uploadData?.title || "Video sin título",
          }
        } 
      });
    } else {
      toast({
        title: "Error",
        description: "No se han recibido datos del análisis todavía. Por favor, espera a que se complete el proceso.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 electric-text">ENVIAR REEL PARA ANÁLISIS</h1>
            <p className="text-muted-foreground font-satoshi">
              Sube tu reel para recibir feedback personalizado de IA
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <ProgressSteps currentStep={uploadStep} />
            
            {uploadStep === "upload" && (
              <VideoUploader onUploadComplete={handleUploadComplete} />
            )}
            
            {(uploadStep === "processing" || uploadStep === "complete") && (
              <ProcessingSteps 
                currentStep={uploadStep} 
                onContinue={handleContinue}
                loadingPhrase={loadingPhrase}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

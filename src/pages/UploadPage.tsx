
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import VideoUploader from "@/components/VideoUploader";
import { Check, ArrowRight, BrainCircuit } from "lucide-react";

const UploadPage = () => {
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "complete">("upload");
  const [uploadData, setUploadData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const navigate = useNavigate();
  
  const handleUploadComplete = (data: any) => {
    setUploadData(data);
    setUploadStep("processing");
    
    // Simulate processing time and receiving webhook response
    // In a real app, this would come from the server response
    setTimeout(() => {
      // Mock feedback data that would come from webhook
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
    }, 90000); // Changed to 90000ms (1 minute and 30 seconds)
  };
  
  const handleContinue = () => {
    // Navigate to the results page with the feedback data
    navigate("/results", { 
      state: { 
        feedback: feedbackData,
        videoData: {
          title: uploadData?.title || "Video sin título",
          videoUrl: uploadData?.video ? URL.createObjectURL(uploadData.video) : null
        }
      } 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 electric-text">SUBIR REEL</h1>
            <p className="text-muted-foreground font-satoshi">
              Sube tu reel para recibir feedback personalizado de IA
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-10">
              <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "upload" 
                      ? "bg-flow-electric text-white" 
                      : "bg-flow-electric/20 text-flow-electric"
                  }`}>
                    {uploadStep !== "upload" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <span className="ml-2 font-medium text-sm font-satoshi">Subir</span>
                </div>
                
                <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "processing" 
                      ? "bg-flow-electric text-white" 
                      : uploadStep === "complete" 
                        ? "bg-flow-electric/20 text-flow-electric" 
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {uploadStep === "complete" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <span className={`ml-2 font-medium text-sm font-satoshi ${
                    uploadStep === "upload" ? "text-muted-foreground" : ""
                  }`}>Procesando</span>
                </div>
                
                <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
                
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    uploadStep === "complete" 
                      ? "bg-flow-electric text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <span>3</span>
                  </div>
                  <span className={`ml-2 font-medium text-sm font-satoshi ${
                    uploadStep !== "complete" ? "text-muted-foreground" : ""
                  }`}>Completado</span>
                </div>
              </div>
            </div>
            
            {uploadStep === "upload" && (
              <VideoUploader onUploadComplete={handleUploadComplete} />
            )}
            
            {uploadStep === "processing" && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-flow-electric/10 mb-6">
                  <div className="w-8 h-8 border-4 border-t-flow-electric border-r-flow-electric border-b-flow-electric/30 border-l-flow-electric/30 rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">PROCESANDO TU REEL</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-4 font-satoshi">
                  Nuestro modelo de IA está analizando tu video. Esto puede tomar unos minutos.
                </p>
                
                {/* New animated elements to show AI processing */}
                <div className="max-w-md mx-auto mt-8 mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="h-10 w-10 text-flow-electric animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-10 bg-muted rounded-md animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                <div className="h-2 w-64 bg-muted rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-flow-electric rounded-full animate-progress"></div>
                </div>
                
                <style>
                  {`
                    @keyframes progress {
                      0% { width: 5%; }
                      20% { width: 25%; }
                      40% { width: 42%; }
                      60% { width: 58%; }
                      80% { width: 75%; }
                      95% { width: 92%; }
                      100% { width: 98%; }
                    }
                    .animate-progress {
                      animation: progress 2.5s ease-in-out infinite;
                    }
                  `}
                </style>
              </div>
            )}
            
            {uploadStep === "complete" && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">¡REEL PROCESADO CON ÉXITO!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 font-satoshi">
                  Tu video ha sido procesado y los resultados están listos para ser visualizados.
                </p>
                <button
                  onClick={handleContinue}
                  className="bg-flow-electric text-white hover:bg-flow-electric/90 px-6 py-3 rounded-md font-medium inline-flex items-center font-satoshi"
                >
                  Ver resultados
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;

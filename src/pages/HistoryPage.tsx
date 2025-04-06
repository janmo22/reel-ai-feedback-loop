
import { useState } from "react";
import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import FeedbackCard from "@/components/FeedbackCard";
import EmptyState from "@/components/EmptyState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, HistoryIcon } from "lucide-react";

// Mock data for demonstration
const mockVideos = [
  {
    id: "1",
    title: "Mi primer TikTok challenge",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    date: "2024-04-05T12:00:00Z",
    status: "completed" as const,
    feedback: {
      overallScore: 7.5,
      categories: [
        {
          name: "Calidad visual",
          score: 8,
          feedback: "La iluminación es buena y el encuadre es apropiado para el formato vertical.",
          suggestions: ["Considera añadir un poco más de contraste para resaltar el sujeto principal."]
        },
        {
          name: "Audio",
          score: 6,
          feedback: "El audio es claro pero hay algo de ruido de fondo que distrae.",
          suggestions: ["Utiliza un micrófono externo o graba en un ambiente más silencioso."]
        },
        {
          name: "Estructura y ritmo",
          score: 8,
          feedback: "Buena narrativa con un ritmo constante que mantiene el interés.",
          suggestions: ["Puedes experimentar con transiciones más rápidas en algunas secciones."]
        }
      ]
    }
  },
  {
    id: "2",
    title: "Tutorial de maquillaje rápido",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    date: "2024-04-04T10:30:00Z",
    status: "processing" as const
  },
  {
    id: "3",
    title: "Mi rutina matutina 2024",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    date: "2024-04-03T15:45:00Z",
    status: "failed" as const
  }
];

const HistoryPage = () => {
  const [selectedVideo, setSelectedVideo] = useState<typeof mockVideos[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleVideoClick = (video: typeof mockVideos[0]) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Historial de reels</h1>
            <p className="text-muted-foreground">
              Visualiza y gestiona tus reels subidos anteriormente
            </p>
          </div>
          
          {mockVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  title={video.title}
                  videoUrl={video.videoUrl}
                  date={video.date}
                  status={video.status}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<HistoryIcon className="h-12 w-12 text-muted-foreground" />}
              title="No hay historial de reels"
              description="Aún no has subido ningún reel para análisis. Comienza subiendo tu primer reel."
              actionLabel="Subir reel"
              actionLink="/upload"
            />
          )}
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedVideo && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
                <p className="text-muted-foreground text-sm">
                  Subido el {new Date(selectedVideo.date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  src={selectedVideo.videoUrl} 
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              
              {selectedVideo.status === "completed" && selectedVideo.feedback && (
                <FeedbackCard
                  title="Análisis de IA"
                  overallScore={selectedVideo.feedback.overallScore}
                  categories={selectedVideo.feedback.categories}
                  isDetailed={true}
                />
              )}
              
              {selectedVideo.status === "processing" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                  <div className="mr-4">
                    <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-yellow-800">El análisis de este reel está en proceso. Por favor, vuelve más tarde.</p>
                </div>
              )}
              
              {selectedVideo.status === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                  <div className="mr-4 text-red-500">⚠️</div>
                  <div>
                    <p className="text-red-800 font-medium">Error en el procesamiento</p>
                    <p className="text-red-600 text-sm">Hubo un problema al analizar este reel. Intenta subirlo nuevamente.</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button>Descargar informe</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;

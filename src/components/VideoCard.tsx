
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface VideoCardProps {
  title: string;
  videoUrl: string;
  date: string;
  status: "processing" | "completed" | "failed";
  onClick?: () => void;
}

const VideoCard = ({ title, videoUrl, date, status, onClick }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "processing":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "failed":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-[9/16] sm:aspect-video bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          poster="/placeholder.svg"
          loop
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="absolute inset-0 flex flex-col justify-between p-3 bg-gradient-to-t from-black/60 via-transparent to-black/30">
          <div className="flex justify-between">
            <Badge variant="outline" className="bg-black/50 text-white border-none backdrop-blur-sm">
              {formatDate(date)}
            </Badge>
            
            <Badge 
              className={`${
                status === "processing" ? "bg-yellow-500" : 
                status === "completed" ? "bg-green-500" : 
                "bg-red-500"
              }`}
            >
              {status === "processing" ? "Procesando" : 
               status === "completed" ? "Completado" : 
               "Error"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-black/50 border-none text-white hover:bg-black/70"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-black/50 border-none text-white hover:bg-black/70"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1">{title}</h3>
      </div>
    </Card>
  );
};

export default VideoCard;


import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Maximize, RotateCcw } from "lucide-react";

interface VideoPreviewProps {
  videoSrc: string;
  onRemove: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc, onRemove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
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
  
  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (!videoRef.current.paused) {
        videoRef.current.play();
      }
    }
  };

  // Listen for video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border/40 bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full aspect-[9/16] sm:aspect-video object-contain bg-black"
        onEnded={handleVideoEnd}
      />
      
      {/* Video controls overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={togglePlayPause}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border-white/40 hover:bg-white/30"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white ml-0.5" />
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={restartVideo}
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border-white/40 hover:bg-white/30"
          >
            <RotateCcw className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
      
      {/* Top controls */}
      <div className="absolute top-3 right-3 flex space-x-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Eliminar video</span>
        </Button>
      </div>
    </div>
  );
};

export default VideoPreview;

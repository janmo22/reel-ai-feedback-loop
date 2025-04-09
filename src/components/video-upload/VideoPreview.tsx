
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPreviewProps {
  videoSrc: string;
  onRemove: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc, onRemove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full aspect-[9/16] sm:aspect-video object-contain bg-black"
        controls
        onClick={togglePlayPause}
      />
      <div className="absolute top-2 right-2 flex space-x-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Eliminar video</span>
        </Button>
      </div>
    </div>
  );
};

export default VideoPreview;


import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useVideoUpload } from "@/hooks/use-video-upload";
import DropZone from "./DropZone";
import VideoPreview from "./VideoPreview";
import UploadForm from "./UploadForm";
import { VideoUploadResponse } from "@/types";

interface VideoUploaderProps {
  onUploadComplete: (data: {
    video: File;
    title: string;
    description: string;
    missions: string[];
    mainMessage: string;
    response: VideoUploadResponse;
  }) => void;
}

const VideoUploader = ({ onUploadComplete }: VideoUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const {
    videoFile,
    videoSrc,
    title,
    description,
    mainMessage,
    missions,
    isUploading,
    uploadProgress,
    isComplete,
    setTitle,
    setDescription,
    setMainMessage,
    handleMissionChange,
    handleFile,
    removeVideo,
    handleSubmit,
  } = useVideoUpload(onUploadComplete);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      {!videoSrc ? (
        <DropZone
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          handleChange={handleChange}
        />
      ) : (
        <VideoPreview videoSrc={videoSrc} onRemove={removeVideo} />
      )}

      {videoFile && (
        <div className="mt-6">
          <UploadForm
            title={title}
            description={description}
            mainMessage={mainMessage}
            missions={missions}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onMainMessageChange={setMainMessage}
            onMissionChange={handleMissionChange}
            onSubmit={handleSubmit}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            isComplete={isComplete}
          />
        </div>
      )}
    </Card>
  );
};

export default VideoUploader;

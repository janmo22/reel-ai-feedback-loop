
import React, { useRef } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DropZone: React.FC<DropZoneProps> = ({
  dragActive,
  handleDrag,
  handleDrop,
  handleChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`drop-zone ${dragActive ? "drop-zone-active animate-pulse-border" : "border-muted-foreground/40"}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="video-upload"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center space-y-4 py-6">
        <div className="rounded-full bg-flow-electric/10 p-3">
          <Upload className="h-8 w-8 text-flow-electric" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            <span className="electric-text font-semibold">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos: MP4, WebM, MOV (máx. 500MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;

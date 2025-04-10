
import React, { useRef } from "react";
import { Upload, FileType, ArrowUpFromLine } from "lucide-react";

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
      className={`group drop-zone relative cursor-pointer transition-all duration-300 ${
        dragActive 
          ? "bg-flow-electric/5 border-flow-electric border-dashed animate-pulse" 
          : "bg-muted/30 border-border/40 hover:border-flow-electric/60 hover:bg-flow-electric/5"
      } border-2 rounded-xl p-8`}
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
      <div className="flex flex-col items-center justify-center space-y-4 py-10">
        <div className="rounded-full bg-flow-electric/10 p-5 group-hover:bg-flow-electric/20 transition-all duration-300">
          <ArrowUpFromLine className="h-10 w-10 text-flow-electric" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium">
            <span className="electric-text font-semibold">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Sube tu reel para obtener un análisis detallado con IA. Formatos: MP4, WebM, MOV (máx. 500MB)
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <FileType className="w-4 h-4" />
          <span>MP4, WebM, MOV (máx. 500MB)</span>
        </div>
      </div>
    </div>
  );
};

export default DropZone;

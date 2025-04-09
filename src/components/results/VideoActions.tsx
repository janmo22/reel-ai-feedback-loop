
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
}

const VideoActions = ({ onSave, onShare }: VideoActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-muted/30 rounded-lg p-6 h-full">
      <h3 className="text-lg font-semibold mb-4">Acciones</h3>
      <div className="flex flex-col space-y-3">
        <Button className="w-full" onClick={onSave}>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          Guardar análisis
        </Button>
        <Button variant="outline" className="w-full" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Compartir resultados
        </Button>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => navigate('/upload')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a subir
        </Button>
      </div>
    </div>
  );
};

export default VideoActions;

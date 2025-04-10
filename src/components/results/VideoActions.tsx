
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
}

const VideoActions = ({ onSave, onShare }: VideoActionsProps) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    setIsSaved(true);
    if (onSave) onSave();
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-100">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-medium">Acciones</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <Button
          variant="outline"
          className={`w-full justify-start ${isSaved ? 'bg-slate-50 border-slate-200 text-indigo-600' : ''}`}
          onClick={handleSave}
        >
          <BookmarkPlus className={`mr-2 h-4 w-4 ${isSaved ? 'text-indigo-600' : ''}`} />
          {isSaved ? 'Guardado en favoritos' : 'Guardar análisis'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={onShare}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartir resultados
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-600"
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

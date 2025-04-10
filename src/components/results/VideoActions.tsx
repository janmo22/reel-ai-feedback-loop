
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookmarkPlus, Share2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const VideoActions = ({ onSave, onShare, isFavorite = false }: VideoActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-100">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-medium">Acciones</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <Button
          variant="outline"
          className={`w-full justify-start ${isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : ''}`}
          onClick={onSave}
        >
          {isFavorite ? (
            <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-500" />
          ) : (
            <BookmarkPlus className="mr-2 h-4 w-4" />
          )}
          {isFavorite ? 'Guardado en favoritos' : 'Guardar análisis'}
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

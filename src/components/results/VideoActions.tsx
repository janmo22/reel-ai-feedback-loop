
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Share2, Star } from "lucide-react";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const VideoActions = ({ onSave, onShare, isFavorite = false }: VideoActionsProps) => {
  return (
    <div className="flex flex-row gap-2 md:flex-col">
      <Button
        variant="outline"
        size="sm"
        className={`flex-1 justify-center md:justify-start ${isFavorite ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
        onClick={onSave}
      >
        {isFavorite ? (
          <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-500" />
        ) : (
          <BookmarkPlus className="mr-2 h-4 w-4" />
        )}
        {isFavorite ? 'Guardado' : 'Guardar'}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="flex-1 justify-center md:justify-start"
        onClick={onShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>
    </div>
  );
};

export default VideoActions;

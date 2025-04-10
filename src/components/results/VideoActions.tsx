
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Share2, Star } from "lucide-react";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const VideoActions = ({ onSave, onShare, isFavorite = false }: VideoActionsProps) => {
  return (
    <div className="flex gap-3 mt-6">
      <Button
        variant="outline"
        size="lg"
        className={`flex-1 justify-center ${isFavorite ? 'bg-violet-50 border-violet-200 text-violet-700' : ''}`}
        onClick={onSave}
      >
        {isFavorite ? (
          <Star className="mr-2 h-4 w-4 fill-violet-400 text-violet-500" />
        ) : (
          <BookmarkPlus className="mr-2 h-4 w-4" />
        )}
        {isFavorite ? 'Guardado' : 'Guardar'}
      </Button>
      
      <Button 
        variant="outline" 
        size="lg"
        className="flex-1 justify-center"
        onClick={onShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>
    </div>
  );
};

export default VideoActions;


import { Button } from "@/components/ui/button";
import { BookmarkPlus, Share2, Star } from "lucide-react";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const VideoActions = ({ onSave, onShare, isFavorite = false }: VideoActionsProps) => {
  return (
    <div className="flex flex-col gap-3 mt-8">
      <Button
        variant="outline"
        size="lg"
        className={`w-full justify-center ${isFavorite ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
        onClick={onSave}
      >
        {isFavorite ? (
          <Star className="mr-2 h-4 w-4 fill-blue-400 text-blue-500" />
        ) : (
          <BookmarkPlus className="mr-2 h-4 w-4" />
        )}
        {isFavorite ? 'Guardado' : 'Guardar'}
      </Button>
      
      <Button 
        variant="outline" 
        size="lg"
        className="w-full justify-center"
        onClick={onShare}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>
    </div>
  );
};

export default VideoActions;

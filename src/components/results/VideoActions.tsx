
import { Button } from "@/components/ui/button";
import { BookmarkPlus, Share2, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface VideoActionsProps {
  onSave?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

const VideoActions = ({ onSave, onShare, isFavorite = false }: VideoActionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSave = async () => {
    if (!onSave || !user) return;
    
    try {
      setIsProcessing(true);
      await Promise.resolve(onSave());
      toast({
        title: isFavorite ? "Eliminado de favoritos" : "Guardado en favoritos",
        description: isFavorite 
          ? "El análisis se ha eliminado de tus favoritos" 
          : "El análisis se ha guardado en tus favoritos",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-8">
      <Button
        variant="outline"
        size="lg"
        className={`w-full justify-center ${
          isFavorite ? 'bg-purple-50 border-purple-300 text-purple-700' : ''
        }`}
        onClick={handleSave}
        disabled={isProcessing || !user}
      >
        {isFavorite ? (
          <Star className="mr-2 h-4 w-4 fill-purple-400 text-purple-500" />
        ) : (
          <BookmarkPlus className="mr-2 h-4 w-4 text-purple-500" />
        )}
        {isFavorite ? 'Guardado' : 'Guardar'}
      </Button>
      
      <Button 
        variant="outline" 
        size="lg"
        className="w-full justify-center hover:bg-purple-50 hover:text-purple-700"
        onClick={onShare}
        disabled={!user}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir
      </Button>
    </div>
  );
};

export default VideoActions;

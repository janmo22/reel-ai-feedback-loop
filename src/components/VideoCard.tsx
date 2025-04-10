
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Clock, Loader2, Star, BookmarkPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface VideoCardProps {
  title: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string | null;
  isFavorite?: boolean;
  onView: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
}

const VideoCard = ({ 
  title,
  thumbnailUrl,
  status,
  createdAt,
  isFavorite = false,
  onView,
  onDelete,
  onToggleFavorite
}: VideoCardProps) => {
  const formattedDate = createdAt 
    ? format(parseISO(createdAt), "d 'de' MMMM, yyyy", { locale: es })
    : "Fecha desconocida";
    
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="p-4 flex-grow space-y-3">
        <div className="flex justify-between items-start">
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center
            ${status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
          `}>
            {status === "processing" && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
            {status === "completed" ? "Completado" : "Procesando"}
          </div>
          
          {onToggleFavorite && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onToggleFavorite}
            >
              <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            </Button>
          )}
        </div>
        
        <h3 className="font-semibold line-clamp-2">{title}</h3>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={onView}
          disabled={status === "processing"}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;

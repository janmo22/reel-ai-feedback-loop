
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Clock, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export interface VideoCardProps {
  title: string;
  thumbnailUrl: string | null;
  status: string;
  createdAt: string | null;
  onView: () => void;
  onDelete: () => void;
}

const VideoCard = ({ 
  title,
  thumbnailUrl,
  status,
  createdAt,
  onView,
  onDelete
}: VideoCardProps) => {
  const formattedDate = createdAt 
    ? format(parseISO(createdAt), "d 'de' MMMM, yyyy", { locale: es })
    : "Fecha desconocida";
    
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden bg-muted h-48">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="rounded-full bg-accent/10 p-4">
              <video className="w-12 h-12 text-accent" />
            </div>
          </div>
        )}
        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start">
          <div className={`
            px-3 py-1.5 rounded-full text-xs font-medium flex items-center
            ${status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
          `}>
            {status === "processing" && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
            {status === "completed" ? "Completado" : "Procesando"}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold line-clamp-2 mb-2">{title}</h3>
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

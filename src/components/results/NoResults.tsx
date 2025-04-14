
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileVideo } from "lucide-react";

interface NoResultsProps {
  error?: string | null;
}

const NoResults = ({ error }: NoResultsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12 flex flex-col items-center">
      <div className="mb-6 bg-muted/30 p-5 rounded-full">
        <FileVideo className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-4">No se encontraron resultados</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error || "No pudimos encontrar los resultados para este video. El análisis podría estar en proceso o haber ocurrido un problema durante el procesamiento."}
      </p>
      <div className="space-x-4">
        <Button variant="default" onClick={() => navigate('/upload')}>
          Subir otro video
        </Button>
        <Button variant="outline" onClick={() => navigate('/history')}>
          Ver historial
        </Button>
      </div>
    </div>
  );
};

export default NoResults;

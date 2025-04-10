
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoadingResults = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <EmptyState 
        icon={<Loader className="h-12 w-12 animate-spin text-flow-electric" />}
        title="Analizando tu reel"
        description={
          <div className="space-y-4">
            <p>
              Estamos procesando tu reel con inteligencia artificial. Este proceso 
              suele tardar aproximadamente <strong>2 minutos</strong> y ocurre en segundo plano.
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Clock className="h-5 w-5" />
              <p className="font-medium">Puedes cerrar esta ventana y consultar los resultados más tarde en tu historial.</p>
            </div>
            <p className="text-muted-foreground italic">
              La página se actualizará automáticamente cuando el análisis esté listo.
            </p>
          </div>
        }
        actionText="Ver historial de videos"
        onAction={() => navigate('/history')}
        actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
      />
    </div>
  );
};

export default LoadingResults;

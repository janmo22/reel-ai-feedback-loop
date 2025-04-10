
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoadingResults = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full h-full flex items-center justify-center py-16">
      <EmptyState 
        icon={<Loader className="h-10 w-10 animate-spin text-flow-blue" />}
        title="Analizando tu video"
        description="Estamos procesando tu reel con inteligencia artificial. Este proceso puede tardar varios minutos y ocurre en segundo plano. La página se actualizará automáticamente cuando el análisis esté listo. Si sales de esta página, podrás consultar los resultados más tarde en tu historial."
        actionText="Volver a historial"
        onAction={() => navigate('/history')}
        actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
      />
    </div>
  );
};

export default LoadingResults;

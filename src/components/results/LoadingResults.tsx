
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoadingResults = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState 
      icon={<Loader className="h-6 w-6 animate-spin text-flow-blue" />}
      title="Procesando video"
      description="Estamos analizando tu reel con IA. Este proceso puede tardar varios minutos. La página se actualizará automáticamente cuando el análisis esté listo."
      actionText="Volver a historial"
      onAction={() => navigate('/history')}
      actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
    />
  );
};

export default LoadingResults;

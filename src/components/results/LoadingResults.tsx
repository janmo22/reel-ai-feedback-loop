
import EmptyState from "@/components/EmptyState";
import { Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoadingResults = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState 
      icon={<Loader className="h-6 w-6 animate-spin text-flow-blue" />}
      title="Esperando resultados"
      description="Estamos a la espera de recibir el análisis de tu reel. Por favor, regresa a la página de carga o intenta más tarde."
      actionText="Volver a subida"
      onAction={() => navigate('/upload')}
      actionIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
    />
  );
};

export default LoadingResults;

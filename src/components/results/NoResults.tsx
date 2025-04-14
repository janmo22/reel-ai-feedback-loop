
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NoResultsProps {
  error?: string;
}

const NoResults = ({ error }: NoResultsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">No se encontraron resultados</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="text-slate-500 mb-6">
        No pudimos encontrar el análisis solicitado. Por favor, intenta subir un nuevo video.
      </p>
      <Button onClick={() => navigate('/upload')}>
        Subir nuevo video
      </Button>
    </div>
  );
};

export default NoResults;

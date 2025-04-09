
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoResults = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold mb-4">No se encontraron resultados</h2>
      <p className="text-muted-foreground mb-6">No pudimos encontrar los resultados para este video.</p>
      <Button onClick={() => navigate('/upload')}>Volver</Button>
    </div>
  );
};

export default NoResults;

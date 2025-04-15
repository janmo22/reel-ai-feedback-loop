
import React from "react";
import FeatureCard from "./FeatureCard";
import { BarChart3, Star, TrendingUp } from "lucide-react";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-6 mt-6">
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={<BarChart3 className="text-white" />} 
          title="Análisis de contenido" 
          description="Recibe métricas detalladas sobre tu contenido y audiencia" 
        />
        
        <FeatureCard 
          icon={<Star className="text-white" />}
          title="Recomendaciones personalizadas" 
          description="Sugerencias adaptadas a tu estilo y temática" 
          colorClass="bg-gradient-to-br from-flow-blue to-flow-accent"
        />
        
        <FeatureCard 
          icon={<TrendingUp className="text-white" />}
          title="Mejora constante" 
          description="Compara tus resultados y visualiza tu progreso con el tiempo" 
          colorClass="bg-gradient-to-r from-flow-blue to-flow-accent"
        />
      </div>
    </div>
  );
};

export default DashboardFeatures;

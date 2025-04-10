
import React from "react";
import { BarChart3, Sparkles, TrendingUp } from "lucide-react";
import FeatureCard from "./FeatureCard";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-6">
        Inteligencia Artificial para creadores
      </h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={<BarChart3 className="h-5 w-5" />}
          title="Análisis de contenido"
          description="Recibe métricas detalladas sobre tu contenido y audiencia"
        />
        
        <FeatureCard 
          icon={<Sparkles className="h-5 w-5" />}
          title="Recomendaciones personalizadas"
          description="Sugerencias adaptadas a tu estilo y temática"
        />
        
        <FeatureCard 
          icon={<TrendingUp className="h-5 w-5" />}
          title="Mejora constante"
          description="Compara tus resultados y visualiza tu progreso con el tiempo"
        />
      </div>
    </div>
  );
};

export default DashboardFeatures;

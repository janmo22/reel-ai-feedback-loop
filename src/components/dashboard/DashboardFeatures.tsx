
import React from "react";
import { BarChart3, Sparkles, TrendingUp, BrainCircuit } from "lucide-react";
import FeatureCard from "./FeatureCard";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <BrainCircuit className="mr-2 text-flow-blue" size={20} />
        Inteligencia Artificial para creadores
      </h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={<BarChart3 className="h-6 w-6 text-flow-blue" />}
          title="Análisis de contenido"
          description="Recibe métricas detalladas sobre tu contenido y audiencia"
        />
        
        <FeatureCard 
          icon={<Sparkles className="h-6 w-6 text-flow-blue" />}
          title="Recomendaciones personalizadas"
          description="Sugerencias adaptadas a tu estilo y temática"
        />
        
        <FeatureCard 
          icon={<TrendingUp className="h-6 w-6 text-flow-blue" />}
          title="Mejora constante"
          description="Compara tus resultados y visualiza tu progreso con el tiempo"
        />
      </div>
    </div>
  );
};

export default DashboardFeatures;


import React from "react";
import { BarChart3, Sparkles, TrendingUp, BrainCircuit } from "lucide-react";
import FeatureCard from "./FeatureCard";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <BrainCircuit className="mr-2 text-flow-accent" size={20} />
        Inteligencia Artificial para creadores
      </h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          title="Análisis de contenido"
          description="Recibe métricas detalladas sobre tu contenido y audiencia"
          colorClass="from-flow-blue to-flow-electric"
        />
        
        <FeatureCard 
          icon={<Sparkles className="h-6 w-6 text-white" />}
          title="Recomendaciones personalizadas"
          description="Sugerencias adaptadas a tu estilo y temática"
          colorClass="from-flow-accent to-flow-blue"
        />
        
        <FeatureCard 
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          title="Mejora constante"
          description="Compara tus resultados y visualiza tu progreso con el tiempo"
          colorClass="from-flow-electric to-flow-accent"
        />
      </div>
    </div>
  );
};

export default DashboardFeatures;

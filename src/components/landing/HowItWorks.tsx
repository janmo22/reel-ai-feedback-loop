
import React from "react";
import { Upload, BarChart3, BrainCircuit } from "lucide-react";
import FeatureCard from "../dashboard/FeatureCard";

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold mb-10 text-center">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Upload className="h-6 w-6 text-white" />} 
            title="Sube tu reel"
            description="Sube tu video en cualquier formato popular y obtén un análisis detallado."
            colorClass="from-flow-blue to-flow-electric"
          />
          
          <FeatureCard 
            icon={<BarChart3 className="h-6 w-6 text-white" />} 
            title="Análisis de IA"
            description="Nuestro modelo analiza múltiples aspectos de tu contenido para optimizarlo."
            colorClass="from-flow-accent to-flow-blue"
          />
          
          <FeatureCard 
            icon={<BrainCircuit className="h-6 w-6 text-white" />} 
            title="Mejora continua"
            description="Recibe recomendaciones personalizadas para mejorar tus futuros videos."
            colorClass="from-flow-electric to-flow-accent"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

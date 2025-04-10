import React from "react";
import FeatureCard from "./FeatureCard";
const DashboardFeatures: React.FC = () => {
  return <div className="mb-10">
      
      
      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17V7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17Z" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 19V10" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 19V5" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 19V14" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 19V8" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>} title="Análisis de contenido" description="Recibe métricas detalladas sobre tu contenido y audiencia" />
        
        <FeatureCard icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L14.5 8.5L20.5 9L16 13.5L17 19.5L12 16.5L7 19.5L8 13.5L3.5 9L9.5 8.5L12 3Z" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>} title="Recomendaciones personalizadas" description="Sugerencias adaptadas a tu estilo y temática" />
        
        <FeatureCard icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V19.5L9 13.5L13.5 18L21 10.5" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 10.5H21V4.5" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>} title="Mejora constante" description="Compara tus resultados y visualiza tu progreso con el tiempo" />
      </div>
    </div>;
};
export default DashboardFeatures;
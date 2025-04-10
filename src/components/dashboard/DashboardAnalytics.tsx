
import React from "react";
import { Video, Sparkles, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";

const DashboardAnalytics: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatCard 
        icon={<Video className="h-5 w-5 text-flow-blue" />}
        title="Videos analizados"
        value="3"
        trend="+2 este mes"
        trendUp={true}
      />
      
      <StatCard 
        icon={<Sparkles className="h-5 w-5 text-flow-blue" />}
        title="Recomendaciones"
        value="24"
        trend="12 aplicadas"
        trendUp={true}
      />
      
      <StatCard 
        icon={<TrendingUp className="h-5 w-5 text-flow-blue" />}
        title="Mejoras detectadas"
        value="68%"
        trend="+12% vs anterior"
        trendUp={true}
      />
    </div>
  );
};

export default DashboardAnalytics;

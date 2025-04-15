
import React from "react";
import { Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const firstName = userName.split(' ')[0];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-flow-blue mb-2">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">Dashboard</span>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            ¡Bienvenido{firstName ? `, ${firstName}` : ''}!
          </h1>
          <p className="text-gray-500">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

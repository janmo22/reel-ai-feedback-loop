
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const firstName = userName.split(' ')[0] || userName.split('@')[0];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <Sparkles className="h-3 w-3 mr-1" />
          Dashboard
        </Badge>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            ¡Bienvenido{firstName ? `, ${firstName}!` : '!'}
          </h1>
          <p className="text-lg text-gray-600">
            Tu centro de comando para crear contenido que conecta y convierte
          </p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-600 mb-2 font-medium">🎯 Crea</div>
          <div className="text-base font-semibold text-gray-900">Guiones estructurados</div>
        </div>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-600 mb-2 font-medium">📊 Analiza</div>
          <div className="text-base font-semibold text-gray-900">Tu contenido y competencia</div>
        </div>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-600 mb-2 font-medium">🚀 Optimiza</div>
          <div className="text-base font-semibold text-gray-900">Basado en datos reales</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

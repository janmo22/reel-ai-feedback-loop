
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-6 mt-6">
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-flow-blue mb-2">
          <Target className="h-5 w-5" />
          <span className="text-sm font-medium">Estrategia</span>
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Define tu estrategia</h2>
        <p className="text-gray-600 mb-6">
          Define tu propuesta de valor, audiencia objetivo y posicionamiento para enfocar mejor tu contenido.
        </p>
        
        <Button asChild>
          <Link to="/strategy">
            Completar mi estrategia
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardFeatures;

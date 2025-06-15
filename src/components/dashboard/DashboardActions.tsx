
import React from "react";
import { Link } from "react-router-dom";
import { Upload, History, ArrowRight, User, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardActions: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-flow-blue/10 p-2 rounded-lg">
            <User className="h-5 w-5 text-flow-blue" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analizar mi perfil</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Obtén un análisis completo de tu perfil de Instagram con insights y recomendaciones de mejora.
        </p>
        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 transition-all group-hover:translate-y-[-2px]">
          <Link to="/my-profile-analysis" className="flex items-center justify-between">
            Analizar mi perfil
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-flow-blue/10 p-2 rounded-lg">
            <Upload className="h-5 w-5 text-flow-blue" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analizar video</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Sube tu reel para obtener feedback profesional con nuestra IA que analizará tu contenido.
        </p>
        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 transition-all group-hover:translate-y-[-2px]">
          <Link to="/upload" className="flex items-center justify-between">
            Subir nuevo reel
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-flow-blue/10 p-2 rounded-lg">
            <Users className="h-5 w-5 text-flow-blue" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analizar competencia</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Estudia a tus competidores y descubre estrategias ganadoras para tu contenido.
        </p>
        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 transition-all group-hover:translate-y-[-2px]">
          <Link to="/competitors" className="flex items-center justify-between">
            Ir a competencia
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      
      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-flow-blue/10 p-2 rounded-lg">
            <History className="h-5 w-5 text-flow-blue" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Ver historial</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Accede a todos tus análisis previos para comparar resultados y ver tu progreso.
        </p>
        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 transition-all group-hover:translate-y-[-2px]">
          <Link to="/history" className="flex items-center justify-between">
            Ver análisis previos
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardActions;

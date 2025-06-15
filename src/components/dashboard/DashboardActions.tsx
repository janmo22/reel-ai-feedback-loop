
import React from "react";
import { Link } from "react-router-dom";
import { Upload, History, ArrowRight, Users, Target, PenTool, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Crear Contenido */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <PenTool className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Crear Contenido</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Crea guiones profesionales para tus videos con nuestra herramienta de creación estructurada.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/create-video" className="flex items-center justify-between">
            Crear nuevo video
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Analizar Video */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Upload className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Analizar Video</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Sube tu reel para obtener feedback profesional con nuestra IA especializada en contenido.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/upload" className="flex items-center justify-between">
            Subir video
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Analizar Competencia */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Competencia</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Descubre estrategias ganadoras analizando el contenido de tus competidores en Instagram.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/competitors" className="flex items-center justify-between">
            Analizar competencia
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Estrategia */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Target className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Estrategia</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Define tu propuesta de valor y audiencia objetivo para enfocar mejor tu contenido.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/strategy" className="flex items-center justify-between">
            Definir estrategia
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Mi Perfil */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Search className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Analiza tu propio perfil de Instagram para identificar oportunidades de mejora.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/my-profile" className="flex items-center justify-between">
            Analizar mi perfil
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Historial */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-lg">
            <History className="h-5 w-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Historial</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Accede a todos tus análisis previos para comparar resultados y ver tu progreso.
        </p>
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 transition-all group-hover:translate-y-[-2px]">
          <Link to="/history" className="flex items-center justify-between">
            Ver historial
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardActions;

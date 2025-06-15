
import React from "react";
import { Link } from "react-router-dom";
import { Upload, History, ArrowRight, Users, Target, PenTool, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardActions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Crear Contenido */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <PenTool className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Crear Contenido</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Crea guiones profesionales para tus videos con nuestra herramienta de creación estructurada.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/create-video" className="flex items-center justify-between">
            Crear nuevo video
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Analizar Video */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Analizar Video</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sube tu reel para obtener feedback profesional con nuestra IA especializada en contenido.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/upload" className="flex items-center justify-between">
            Subir video
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Analizar Competencia */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Competencia</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Descubre estrategias ganadoras analizando el contenido de tus competidores en Instagram.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/competitors" className="flex items-center justify-between">
            Analizar competencia
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Estrategia */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Estrategia</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Define tu propuesta de valor y audiencia objetivo para enfocar mejor tu contenido.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/strategy" className="flex items-center justify-between">
            Definir estrategia
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Mi Perfil */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Mi Perfil</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Analiza tu propio perfil de Instagram para identificar oportunidades de mejora.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/my-profile" className="flex items-center justify-between">
            Analizar mi perfil
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {/* Historial */}
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
            <History className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Historial</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Accede a todos tus análisis previos para comparar resultados y ver tu progreso.
        </p>
        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-medium transition-all group-hover:scale-105">
          <Link to="/history" className="flex items-center justify-between">
            Ver historial
            <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardActions;

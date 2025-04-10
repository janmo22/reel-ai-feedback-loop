
import React from "react";
import { Link } from "react-router-dom";
import { Upload, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardActions: React.FC = () => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-5">
          <Upload className="h-5 w-5 text-flow-blue" />
          <h3 className="text-lg font-medium">Nuevo análisis</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Sube tu reel para obtener feedback profesional con nuestra IA que analizará tu contenido.
        </p>
        <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 transition-all">
          <Link to="/upload" className="flex items-center justify-between">
            Subir nuevo reel
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-5">
          <History className="h-5 w-5 text-flow-blue" />
          <h3 className="text-lg font-medium">Ver historial</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Accede a todos tus análisis previos para comparar resultados y ver tu progreso.
        </p>
        <Button asChild variant="outline" className="w-full border-flow-blue/30 text-flow-blue hover:bg-flow-blue/5">
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


import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Upload, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardActions: React.FC = () => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="overflow-hidden group border-transparent hover:border-flow-blue/20 transition-all duration-300 shadow-sm hover:shadow-md">
        <CardHeader className="pb-6 border-b border-border/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-flow-blue/10 rounded-full">
              <Upload className="h-6 w-6 text-flow-blue" />
            </div>
            <CardTitle>Nuevo análisis</CardTitle>
          </div>
          <CardDescription className="text-base">
            Sube tu reel para obtener feedback profesional
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-6">
            Nuestra IA analizará tu contenido para brindarte recomendaciones personalizadas
            que te ayudarán a mejorar el alcance de tus reels.
          </p>
          <Button asChild className="w-full bg-flow-blue hover:bg-flow-blue/90 group-hover:shadow-md transition-all duration-300">
            <Link to="/upload" className="flex items-center justify-between">
              Subir nuevo reel
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden group border-transparent hover:border-flow-blue/20 transition-all duration-300 shadow-sm hover:shadow-md">
        <CardHeader className="pb-6 border-b border-border/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-flow-blue/10 rounded-full">
              <History className="h-6 w-6 text-flow-blue" />
            </div>
            <CardTitle>Ver historial</CardTitle>
          </div>
          <CardDescription className="text-base">
            Revisa tus análisis anteriores
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-6">
            Accede a todos tus análisis previos para comparar resultados
            y ver tu progreso a lo largo del tiempo.
          </p>
          <Button asChild variant="outline" className="w-full border-flow-blue/30 text-flow-blue hover:bg-flow-blue/10 hover:text-flow-blue">
            <Link to="/history" className="flex items-center justify-between">
              Ver análisis previos
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardActions;

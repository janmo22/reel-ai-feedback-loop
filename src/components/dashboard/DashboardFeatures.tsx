
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Check, ChevronRight, X } from "lucide-react";
import StrategyForm from "@/components/strategy/StrategyForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const DashboardFeatures: React.FC = () => {
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  if (showStrategyForm) {
    return (
      <div className="mb-6 mt-6 animate-fade-in">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Estrategia de contenido
              </CardTitle>
              <CardDescription className="text-gray-600">
                Define tu estrategia para maximizar el impacto de tus videos
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowStrategyForm(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <StrategyForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6 mt-6">
      <Card className="border-gray-200 overflow-hidden transition-all hover:shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gray-50 p-6 md:w-1/3 border-r border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Estrategia</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <h3 className="text-lg font-medium mb-2 text-gray-900">Define tu estrategia</h3>
            <p className="text-sm text-gray-600 mb-4">
              Establece tu propuesta de valor y audiencia para crear contenido más efectivo.
            </p>
            
            <Button 
              onClick={() => setShowStrategyForm(true)} 
              size="sm"
              className="group flex items-center gap-2 bg-gray-900 hover:bg-gray-800 transition-all"
            >
              Completar estrategia
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white p-6 md:w-2/3">
            <h4 className="text-sm font-medium mb-3 text-gray-700">Beneficios:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">Análisis más precisos y personalizados</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">Contenido alineado con tu audiencia</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">Posicionamiento claro en tu nicho</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardFeatures;

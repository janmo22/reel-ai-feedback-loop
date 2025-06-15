
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, Check, ChevronRight } from "lucide-react";
import StrategyForm from "@/components/strategy/StrategyForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const DashboardFeatures: React.FC = () => {
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  
  if (showStrategyForm) {
    return (
      <div className="mb-6 mt-6 animate-fade-in">
        <Card className="border-flow-blue/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-flow-blue/5 to-flow-accent/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold text-flow-blue flex items-center gap-2">
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
              className="text-flow-blue hover:text-flow-accent hover:bg-flow-blue/5"
            >
              <Check className="h-4 w-4 mr-1" /> Regresar al dashboard
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
      <Card className="border-flow-blue/20 overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gradient-to-br from-flow-blue/10 to-flow-accent/10 p-6 md:w-1/3">
            <div className="flex items-center gap-2 text-flow-blue mb-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Estrategia</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Define tu estrategia</h2>
            <p className="text-gray-600 mb-6">
              Define tu propuesta de valor, audiencia objetivo y posicionamiento para enfocar mejor tu contenido.
            </p>
            
            <Button 
              onClick={() => setShowStrategyForm(true)} 
              className="group flex items-center gap-2 bg-flow-blue hover:bg-flow-accent transition-all"
            >
              Completar mi estrategia
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white p-6 md:w-2/3">
            <h3 className="text-lg font-medium mb-3 text-gray-800">¿Por qué es importante?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">Clarifica tu mensaje y propuesta de valor para tu audiencia</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">Define quién es tu público objetivo para crear contenido relevante</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">Establece tu posicionamiento para destacar en tu nicho</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardFeatures;

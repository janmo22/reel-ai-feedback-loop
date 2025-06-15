
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
        <div className="bg-white p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Estrategia de Contenido</h2>
                <p className="text-gray-600">Define tu estrategia para maximizar el impacto</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowStrategyForm(false)}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <StrategyForm />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 mt-6">
      <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden hover:shadow-lg transition-all">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 md:w-1/2 border-r border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-200 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-700">ESTRATEGIA</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-blue-400 hover:text-blue-600 h-8 w-8 p-0 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Define tu estrategia</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Establece tu propuesta de valor y audiencia para crear contenido más efectivo.
            </p>
            
            <Button 
              onClick={() => setShowStrategyForm(true)} 
              className="group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            >
              Completar estrategia
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="bg-white p-8 md:w-1/2">
            <h4 className="text-lg font-semibold mb-6 text-gray-900">Beneficios:</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Análisis más precisos y personalizados</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Contenido alineado con tu audiencia</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-1 rounded-full mt-1">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Posicionamiento claro en tu nicho</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFeatures;

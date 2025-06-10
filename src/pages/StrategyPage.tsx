
import React, { useEffect, useState } from "react";
import StrategyForm from "@/components/strategy/StrategyForm";
import ContentSeriesManager from "@/components/strategy/ContentSeriesManager";
import { Target, Video } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StrategyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string>("value");
  
  // Extract tab from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['value', 'video-strategy'].includes(tab)) {
      setCurrentTab(tab);
    } else if (!location.search) {
      // Default tab if no query parameter is present
      setCurrentTab("value");
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    navigate(`/strategy?tab=${value}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 flex items-center gap-3">
            <Target className="h-7 w-7 text-flow-blue" />
            Estrategia de contenido
          </h1>
          <p className="text-gray-500">
            Define tu estrategia de contenido para maximizar el impacto de tus videos
          </p>
        </div>
        
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="value" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Propuesta de Valor
            </TabsTrigger>
            <TabsTrigger value="video-strategy" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Estrategia de Videos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="value">
            <StrategyForm currentTab={currentTab} />
          </TabsContent>
          
          <TabsContent value="video-strategy">
            <ContentSeriesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StrategyPage;

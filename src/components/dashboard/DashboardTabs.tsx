
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardInsights from "./DashboardInsights";

const DashboardTabs: React.FC = () => {
  return (
    <div className="mb-8">
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="mb-8 bg-blue-50 w-full justify-start rounded-xl gap-2 h-auto p-2 border border-blue-200">
          <TabsTrigger 
            value="actions" 
            className="text-sm rounded-lg px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent font-medium text-blue-600 hover:bg-blue-100 transition-all"
          >
            Acciones Rápidas
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-sm rounded-lg px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent font-medium text-blue-600 hover:bg-blue-100 transition-all"
          >
            Métricas
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="text-sm rounded-lg px-6 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg bg-transparent font-medium text-blue-600 hover:bg-blue-100 transition-all"
          >
            Insights
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="mt-0 animate-fade-in">
          <DashboardActions />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0 animate-fade-in">
          <DashboardAnalytics />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-0 animate-fade-in">
          <DashboardInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;

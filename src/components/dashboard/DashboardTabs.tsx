
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";

const DashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="actions" className="w-full">
      <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none gap-6 h-auto pb-2">
        <TabsTrigger 
          value="actions" 
          className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent"
        >
          Acciones
        </TabsTrigger>
        <TabsTrigger 
          value="analytics" 
          className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent"
        >
          Analíticas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="actions" className="space-y-6 mt-4">
        <DashboardActions />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6 mt-4">
        <DashboardAnalytics />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;


import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";

const DashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="actions" className="w-full mb-12">
      <TabsList className="mb-8 bg-transparent w-full justify-start rounded-none gap-8 h-auto pb-2 border-b border-border/20">
        <TabsTrigger 
          value="actions" 
          className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent px-0"
        >
          Acciones
        </TabsTrigger>
        <TabsTrigger 
          value="analytics" 
          className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent px-0"
        >
          Analíticas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="actions" className="mt-0">
        <DashboardActions />
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-0">
        <DashboardAnalytics />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

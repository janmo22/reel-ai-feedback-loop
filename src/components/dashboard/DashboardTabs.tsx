
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";

const DashboardTabs: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <Tabs defaultValue="actions" className="w-full mb-6">
        <TabsList className="mb-8 bg-transparent w-full justify-start rounded-none gap-8 h-auto pb-2 border-b border-border/20">
          <TabsTrigger 
            value="actions" 
            className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent px-0 font-medium"
          >
            Acciones
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-flow-blue data-[state=active]:bg-transparent data-[state=active]:text-flow-blue bg-transparent px-0 font-medium"
          >
            Analíticas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="mt-0 animate-fade-in">
          <DashboardActions />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-0 animate-fade-in">
          <DashboardAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;


import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";
import DashboardInsights from "./DashboardInsights";

const DashboardTabs: React.FC = () => {
  return (
    <div className="mb-8">
      <Tabs defaultValue="actions" className="w-full mb-6">
        <TabsList className="mb-8 bg-transparent w-full justify-start rounded-none gap-8 h-auto pb-2 border-b border-gray-100">
          <TabsTrigger 
            value="actions" 
            className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 bg-transparent px-0 font-medium text-gray-600"
          >
            Acciones
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 bg-transparent px-0 font-medium text-gray-600"
          >
            Analíticas
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 bg-transparent px-0 font-medium text-gray-600"
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


import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardActions from "./DashboardActions";
import DashboardAnalytics from "./DashboardAnalytics";

const DashboardTabs: React.FC = () => {
  return (
    <Tabs defaultValue="actions" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="actions">Acciones</TabsTrigger>
        <TabsTrigger value="analytics">Analíticas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="actions" className="space-y-6">
        <DashboardActions />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6">
        <DashboardAnalytics />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;

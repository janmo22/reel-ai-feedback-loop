
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import StrategyForm from "@/components/strategy/StrategyForm";
import { Target } from "lucide-react";
import Header from "@/components/Header";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

const StrategyPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50">
      {user ? (
        <div className="flex flex-1">
          <DashboardSidebar />
          <SidebarInset className="bg-gray-50 overflow-auto">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
              <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 flex items-center gap-3">
                    <Target className="h-8 w-8 text-flow-blue" />
                    Estrategia de contenido
                  </h1>
                  <p className="text-gray-500">
                    Define tu estrategia de contenido para maximizar el impacto de tus videos
                  </p>
                </div>
                
                <StrategyForm />
              </div>
            </div>
          </SidebarInset>
        </div>
      ) : (
        <>
          <Header />
          <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 flex items-center gap-3">
                  <Target className="h-8 w-8 text-flow-blue" />
                  Estrategia de contenido
                </h1>
                <p className="text-gray-500">
                  Define tu estrategia de contenido para maximizar el impacto de tus videos
                </p>
              </div>
              
              <StrategyForm />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StrategyPage;

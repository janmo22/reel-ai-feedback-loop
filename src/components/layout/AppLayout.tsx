
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import MobileMenuButton from "./MobileMenuButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Detectar cambios de ruta para mostrar/ocultar el indicador de carga
  useEffect(() => {
    setIsLoading(true);
    
    // Simular el tiempo mínimo de carga para mostrar el loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 w-full">
      <DashboardSidebar />
      <SidebarInset className="bg-gray-50 overflow-auto flex-1">
        {/* Botón menú solo visible en móvil */}
        {isMobile && <MobileMenuButton />}
        <Header />
        
        {/* Indicador de carga global */}
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-flow-blue to-flow-electric z-50">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-flow-electric animate-pulse"></div>
          </div>
        )}
        
        {children}
      </SidebarInset>
    </div>
  );
};

export default AppLayout;

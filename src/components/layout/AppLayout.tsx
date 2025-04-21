
import React from "react";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import MobileMenuButton from "./MobileMenuButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 w-full">
      <DashboardSidebar />
      <SidebarInset className="bg-gray-50 overflow-auto flex-1">
        {/* Botón menú solo visible en móvil */}
        {isMobile && <MobileMenuButton />}
        <Header />
        {children}
      </SidebarInset>
    </div>
  );
};

export default AppLayout;

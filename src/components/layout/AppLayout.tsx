
import React from "react";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 w-full">
      <DashboardSidebar />
      <SidebarInset className="bg-gray-50 overflow-auto flex-1">
        <Header />
        {children}
      </SidebarInset>
    </div>
  );
};

export default AppLayout;

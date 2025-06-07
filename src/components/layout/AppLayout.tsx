
import React from "react";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

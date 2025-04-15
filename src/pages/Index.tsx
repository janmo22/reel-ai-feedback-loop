
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/layout/Footer";
import DashboardFeatures from "@/components/dashboard/DashboardFeatures";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

const Index: React.FC = () => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.first_name || user?.email || '';
  
  if (user) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-white to-gray-50 w-full">
        <DashboardSidebar />
        <SidebarInset className="bg-gray-50 overflow-auto flex-1">
          <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-5xl">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
              <DashboardHeader userName={userName} />
              <DashboardTabs />
              <DashboardFeatures />
            </div>
          </div>
        </SidebarInset>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Index;

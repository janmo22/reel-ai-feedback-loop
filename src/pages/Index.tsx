
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50 w-full">
        <div className="flex flex-1 h-screen">
          <DashboardSidebar />
          <SidebarInset className="bg-gray-50 overflow-auto">
            <div className="container mx-auto py-12 px-4 max-w-5xl">
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <DashboardHeader userName={userName} />
                <DashboardTabs />
                <DashboardFeatures />
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Index;

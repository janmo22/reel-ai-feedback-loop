
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/layout/Footer";
import DashboardFeatures from "@/components/dashboard/DashboardFeatures";

const Index: React.FC = () => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.first_name || user?.email || '';
  
  if (user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <DashboardHeader userName={userName} />
          <DashboardTabs />
          <DashboardFeatures />
        </div>
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

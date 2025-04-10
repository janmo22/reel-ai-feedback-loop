
import React from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import DashboardFeatures from "@/components/dashboard/DashboardFeatures";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/layout/Footer";

const Index: React.FC = () => {
  const { user } = useAuth();
  
  const userName = user?.user_metadata?.first_name || user?.email || '';
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {user ? (
          <div className="container mx-auto py-16 px-4 max-w-5xl">
            <DashboardHeader userName={userName} />
            <DashboardTabs />
            <DashboardFeatures />
          </div>
        ) : (
          <>
            <HeroSection />
            <HowItWorks />
            <CallToAction />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;


import React from "react";
import { LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold mb-3 flex items-center gap-2">
        <LayoutDashboard className="text-flow-blue" size={30} />
        <span className="text-flow-blue">
          Dashboard
        </span>
      </h1>
      <p className="text-lg text-muted-foreground">
        Hola, {userName}. ¿Qué te gustaría hacer hoy?
      </p>
    </div>
  );
};

export default DashboardHeader;

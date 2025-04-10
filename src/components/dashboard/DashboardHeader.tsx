
import React from "react";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold mb-3">
        Dashboard
      </h1>
      <p className="text-lg text-muted-foreground">
        Hola, {userName}. ¿Qué te gustaría hacer hoy?
      </p>
    </div>
  );
};

export default DashboardHeader;


import React from "react";
import UserMissionForm from "./UserMissionForm";

const DashboardFeatures: React.FC = () => {
  return (
    <div className="mb-6 mt-6">
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Define tu estrategia</h2>
        <p className="text-gray-600 mb-6">Define tu propuesta de valor y misión para enfocar mejor tu contenido y analíticas.</p>
        
        <UserMissionForm />
      </div>
    </div>
  );
};

export default DashboardFeatures;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  colorClass = "bg-gradient-to-br from-flow-blue to-flow-blue/70"
}) => {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorClass} group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

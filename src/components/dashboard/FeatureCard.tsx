
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
  colorClass
}) => {
  return (
    <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all group">
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClass || 'bg-flow-blue'} group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

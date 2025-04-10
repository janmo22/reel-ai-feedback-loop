
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass?: string;  // Added as an optional prop
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  colorClass,
}) => {
  return (
    <Card className="overflow-hidden border-transparent shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col items-start">
          <div className={`p-2.5 rounded-full ${colorClass ? `bg-gradient-to-r ${colorClass}` : 'bg-flow-blue/10'} mb-4`}>
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

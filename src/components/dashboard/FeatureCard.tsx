
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  colorClass,
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
      <div className={`bg-gradient-to-br ${colorClass} p-4 flex items-center justify-center`}>
        <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

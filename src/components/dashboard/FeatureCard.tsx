
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
}) => {
  return (
    <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="text-flow-blue mb-5">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;

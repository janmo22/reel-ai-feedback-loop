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
  description
}) => {
  return <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all">
      
    </Card>;
};
export default FeatureCard;
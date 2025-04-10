
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  trend,
  trendUp = true,
}) => {
  return (
    <Card className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex flex-col">
          <div className="text-flow-blue mb-5">{icon}</div>
          
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          
          <div className="mt-1">
            <p className="text-2xl font-medium">{value}</p>
            
            <p className={`text-sm mt-1 ${
              trendUp ? "text-emerald-600" : "text-red-500"
            }`}>
              {trend}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;

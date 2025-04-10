
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
    <Card className="border-none bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="text-flow-blue">{icon}</div>
          <span
            className={`text-xs ${
              trendUp ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {trend}
          </span>
        </div>
        <h4 className="text-2xl font-medium mb-1">{value}</h4>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;

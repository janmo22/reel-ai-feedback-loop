
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
    <Card className="border-transparent shadow-sm hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-md bg-flow-blue/10">{icon}</div>
          <span
            className={`text-xs flex items-center ${
              trendUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend}
            {trendUp ? (
              <ArrowRight className="h-3 w-3 ml-1 rotate-[-45deg]" />
            ) : (
              <ArrowRight className="h-3 w-3 ml-1 rotate-45" />
            )}
          </span>
        </div>
        <h4 className="text-3xl font-bold mb-1">{value}</h4>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;

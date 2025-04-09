
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
    <Card className="border-muted/40">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 rounded-md bg-muted">{icon}</div>
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
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </CardContent>
    </Card>
  );
};

export default StatCard;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    <Card className="overflow-hidden border border-border/30 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="flex flex-col">
          <div className="bg-flow-blue/10 p-2.5 rounded-lg w-fit flex items-center justify-center mb-5">
            <div className="text-flow-blue">{icon}</div>
          </div>
          
          <h3 className="text-base font-semibold mb-2 text-gray-500">{title}</h3>
          
          <div className="mt-1 flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            <div className={`flex items-center text-sm ${
              trendUp ? "text-emerald-600" : "text-red-500"
            }`}>
              {trendUp ? 
                <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                <ArrowDownRight className="h-4 w-4 mr-1" />
              }
              <span>{trend}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ThumbsUp } from "lucide-react";
import ScoreBubble from "@/components/ui/score-bubble";

interface FeedbackCardProps {
  title: string;
  overallScore: number;
  categories: {
    name: string;
    score?: number;
    feedback: string;
    suggestions?: string[];
    isHighlighted?: boolean;
  }[];
  isDetailed?: boolean;
  showScores?: boolean;
  highlightCategories?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

const FeedbackCard = ({ 
  title, 
  overallScore, 
  categories, 
  isDetailed = true,
  showScores = true,
  highlightCategories = false,
  icon, 
  accentColor = "bg-slate-50 border-slate-100" 
}: FeedbackCardProps) => {
  const [expanded, setExpanded] = useState(isDetailed);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className={`pb-3 ${expanded ? accentColor : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
            </div>
          </div>
          {showScores && (
            <ScoreBubble score={overallScore} size="sm" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between items-center mb-2 py-1 hover:bg-slate-50"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-medium text-sm text-slate-600">{expanded ? "Ocultar detalles" : "Ver detalles"}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        
        {expanded && (
          <div className="space-y-5 mt-4 animate-in fade-in-50 duration-300">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`border-b last:border-b-0 pb-5 last:pb-0 mb-5 last:mb-0 ${
                  category.isHighlighted || (highlightCategories && category.name === "Esto te va a dar más Flow") 
                    ? "bg-blue-50 p-4 rounded-md border border-blue-100" 
                    : ""
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-slate-800">{category.name}</h4>
                  {showScores && category.score !== undefined && (
                    <ScoreBubble score={category.score} size="sm" showLabel={false} />
                  )}
                </div>
                
                <p className="text-sm text-slate-700 mb-4">{category.feedback}</p>
                
                {category.suggestions && category.suggestions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-md mt-4 border-l-2 border-blue-500">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Recomendaciones:</h5>
                    <ul className="space-y-3">
                      {category.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <ThumbsUp size={14} className="text-blue-600 flex-shrink-0 mt-1" />
                          <span className="text-slate-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;

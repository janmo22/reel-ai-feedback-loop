
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ThumbsUp, Lightbulb, MessageSquare, AlertTriangle } from "lucide-react";

interface FeedbackCardProps {
  title: string;
  overallScore: number;
  categories: {
    name: string;
    score: number;
    feedback: string;
    suggestions?: string[];
  }[];
  isDetailed?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

const FeedbackCard = ({ 
  title, 
  overallScore, 
  categories, 
  isDetailed = true, 
  icon, 
  accentColor = "bg-blue-50 border-blue-100" 
}: FeedbackCardProps) => {
  const [expanded, setExpanded] = useState(isDetailed);
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className={`transition-all duration-300 ease-in-out hover:shadow-md ${expanded ? 'shadow-md' : 'shadow-sm'}`}>
      <CardHeader className={`pb-3 ${expanded ? accentColor : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
              <CardDescription>Análisis de IA</CardDescription>
            </div>
          </div>
          <Badge className={`text-white ${getScoreColor(overallScore)} px-3 py-1`}>
            {overallScore}/10
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between items-center mb-2 py-1 hover:bg-slate-50"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-medium">{expanded ? "Ocultar detalles" : "Ver detalles"}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
        
        {expanded && (
          <div className="space-y-4 mt-3 animate-in fade-in-50 duration-300">
            {categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-slate-800">{category.name}</h4>
                  <Badge className={`${getScoreColor(category.score)}`}>
                    {category.score}/10
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-700 mb-3">{category.feedback}</p>
                
                {category.suggestions && category.suggestions.length > 0 && (
                  <div className="space-y-2 bg-amber-50 p-3 rounded-md mt-3 border border-amber-100">
                    <h5 className="text-sm font-medium flex items-center text-amber-800">
                      <Lightbulb size={16} className="text-amber-600 mr-2" />
                      Recomendaciones:
                    </h5>
                    <ul className="space-y-2">
                      {category.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <ThumbsUp size={16} className="text-green-600 flex-shrink-0 mt-1" />
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

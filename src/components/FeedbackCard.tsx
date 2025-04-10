
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ThumbsUp, Lightbulb } from "lucide-react";

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
}

const FeedbackCard = ({ title, overallScore, categories, isDetailed = true }: FeedbackCardProps) => {
  const [expanded, setExpanded] = useState(isDetailed);
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>Análisis de IA</CardDescription>
          </div>
          <Badge className={`text-white ${getScoreColor(overallScore)} px-3 py-1`}>
            {overallScore}/10
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between items-center mb-2 py-1"
          onClick={() => setExpanded(!expanded)}
        >
          <span>Ver {expanded ? "menos" : "más"} detalles</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        
        {expanded && (
          <div className="space-y-4 mt-2 animate-fade-in">
            {categories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{category.name}</h4>
                  <Badge className={`${getScoreColor(category.score)}`}>
                    {category.score}/10
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{category.feedback}</p>
                
                {category.suggestions && category.suggestions.length > 0 && (
                  <div className="space-y-2 bg-muted/30 p-3 rounded-md mt-3">
                    <h5 className="text-sm font-medium flex items-center">
                      <Lightbulb size={16} className="text-yellow-500 mr-2" />
                      Sugerencias:
                    </h5>
                    <ul className="space-y-2">
                      {category.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm flex gap-2">
                          <ThumbsUp size={16} className="text-green-500 flex-shrink-0 mt-1" />
                          <span>{suggestion}</span>
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

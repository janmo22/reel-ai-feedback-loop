
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";

interface AIFeedbackProps {
  feedback: {
    generalStudy: string;
    contentType: string;
    overallEvaluation: {
      score: number;
      suggestions: string[];
    };
  };
}

const AIFeedbackCard = ({ feedback }: AIFeedbackProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-flow-electric/20 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-flow-electric/5 to-flow-electric/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Análisis General</CardTitle>
            <div className="flex items-center mt-1">
              <Badge className="bg-blue-500 mr-2">{feedback.contentType}</Badge>
            </div>
          </div>
          <div className="text-center">
            <Badge className={`text-white ${getScoreColor(feedback.overallEvaluation.score)} px-5 py-2 rounded-full text-lg`}>
              {feedback.overallEvaluation.score}/10
            </Badge>
            <div className="text-xs mt-1 text-muted-foreground">Puntuación global</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-6">
          <h4 className="font-medium text-base mb-2">Resumen del contenido</h4>
          <p className="text-muted-foreground">{feedback.generalStudy}</p>
        </div>
        
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-base mb-2">Sugerencias para mejorar</h4>
          {feedback.overallEvaluation.suggestions.map((suggestion, idx) => (
            <div key={idx} className="flex gap-2 bg-muted/30 p-3 rounded-md">
              <ThumbsUp size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFeedbackCard;

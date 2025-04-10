
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, BarChart3 } from "lucide-react";
import { AIFeedbackResponse } from "@/types";

interface AIFeedbackProps {
  feedback: AIFeedbackResponse;
}

const AIFeedbackCard = ({ feedback }: AIFeedbackProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const executiveSummary = feedback.feedback_data?.executiveSummary || feedback.generalStudy;
  const contentType = feedback.feedback_data?.contentTypeStrategy?.classification || feedback.contentType || "Análisis de contenido";
  const score = feedback.overallEvaluation?.score || 0;
  const suggestions = feedback.overallEvaluation?.suggestions || [];

  return (
    <Card className="border-flow-electric/20 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-flow-electric/5 to-flow-electric/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Análisis General</CardTitle>
            <div className="flex items-center mt-1">
              <Badge className="bg-blue-500 mr-2">{contentType}</Badge>
              {feedback.feedback_data?.videoStructureAndPacing?.valueDelivery?.mainFunction && (
                <Badge className="bg-purple-500 mr-2">
                  {feedback.feedback_data.videoStructureAndPacing.valueDelivery.mainFunction}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center">
            <Badge className={`text-white ${getScoreColor(score)} px-5 py-2 rounded-full text-lg`}>
              {score}/10
            </Badge>
            <div className="text-xs mt-1 text-muted-foreground">Puntuación global</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-6">
          <h4 className="font-medium text-base mb-2">Resumen ejecutivo</h4>
          <p className="text-muted-foreground">{executiveSummary}</p>
        </div>
        
        {feedback.feedback_data?.strategicAlignment && (
          <div className="mb-6 p-4 bg-muted/30 rounded-md">
            <h4 className="font-medium text-base mb-2 flex items-center">
              <BarChart3 size={16} className="mr-2 text-blue-500" />
              Alineación estratégica
            </h4>
            <p className="text-sm text-muted-foreground">
              {feedback.feedback_data.strategicAlignment.creatorConsistencyComment}
            </p>
          </div>
        )}
        
        <div className="space-y-3 mt-6">
          <h4 className="font-medium text-base mb-2">Sugerencias para mejorar</h4>
          {suggestions.map((suggestion, idx) => (
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

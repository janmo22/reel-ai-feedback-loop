
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, BarChart3, Star, Lightbulb, Award } from "lucide-react";
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
  const finalRecommendations = feedback.feedback_data?.finalEvaluation?.finalRecommendations || feedback.overallEvaluation?.suggestions || [];

  return (
    <Card className="border-flow-electric/20 shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">Análisis General</CardTitle>
            <div className="flex items-center mt-2">
              <Badge className="bg-blue-500 mr-2 px-2 py-1">{contentType}</Badge>
              {feedback.feedback_data?.videoStructureAndPacing?.valueDelivery?.mainFunction && (
                <Badge className="bg-purple-500 mr-2 px-2 py-1">
                  {feedback.feedback_data.videoStructureAndPacing.valueDelivery.mainFunction}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className={`${getScoreColor(score)} text-white rounded-full w-16 h-16 flex items-center justify-center`}>
              <span className="text-xl font-bold">{score}/10</span>
            </div>
            <div className="text-xs mt-1 text-muted-foreground">Puntuación global</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-6">
          <h4 className="font-semibold text-lg text-slate-800 mb-2 flex items-center">
            <Star className="mr-2 h-5 w-5 text-amber-500" />
            Resumen ejecutivo
          </h4>
          <p className="text-base text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{executiveSummary}</p>
        </div>
        
        <div className="mt-8">
          <h4 className="font-semibold text-lg text-slate-800 mb-3 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
            Recomendaciones principales
          </h4>
          <div className="space-y-3 rounded-lg bg-amber-50 p-4 border border-amber-100">
            {finalRecommendations.map((recommendation, idx) => (
              <div key={idx} className="flex gap-3">
                <Award className="text-amber-600 flex-shrink-0 mt-1 h-5 w-5" />
                <p className="text-base text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
        
        {feedback.feedback_data?.strategicAlignment && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="font-semibold text-lg text-slate-800 mb-2 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
              Alineación estratégica
            </h4>
            <p className="text-base text-slate-700">
              {feedback.feedback_data.strategicAlignment.creatorConsistencyComment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFeedbackCard;

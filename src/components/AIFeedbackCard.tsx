
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Lightbulb } from "lucide-react";
import { AIFeedbackResponse } from "@/types";

const AIFeedbackCard = ({ feedback }: { feedback: AIFeedbackResponse }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-blue-500";
    if (score >= 6) return "bg-blue-400";
    return "bg-red-500";
  };

  const executiveSummary = feedback.feedback_data?.executiveSummary || feedback.generalStudy;
  const contentType = feedback.feedback_data?.contentTypeStrategy?.classification || feedback.contentType || "Análisis de contenido";
  const score = feedback.overallEvaluation?.score || 0;
  const finalRecommendations = feedback.feedback_data?.finalEvaluation?.finalRecommendations || feedback.overallEvaluation?.suggestions || [];

  return (
    <Card className="border-blue-200 shadow-md">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-blue-800">Análisis General</CardTitle>
            <div className="flex items-center mt-2">
              <Badge variant="outline" className="border-blue-200 text-blue-700 mr-2 px-2 py-1">{contentType}</Badge>
              {feedback.feedback_data?.videoStructureAndPacing?.valueDelivery?.mainFunction && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 mr-2 px-2 py-1">
                  {feedback.feedback_data.videoStructureAndPacing.valueDelivery.mainFunction}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className={`${getScoreColor(score)} text-white rounded-full w-14 h-14 flex items-center justify-center`}>
              <span className="text-xl font-bold">{score}/10</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="mb-6">
          <h4 className="font-semibold text-lg text-blue-800 mb-3 flex items-center">
            <Star className="mr-2 h-5 w-5 text-blue-500" /> Resumen ejecutivo
          </h4>
          <p className="text-base text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-100">{executiveSummary}</p>
        </div>
        
        <div className="mt-8">
          <h4 className="font-semibold text-lg text-blue-800 mb-4 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-blue-500" /> Recomendaciones principales
          </h4>
          <div className="space-y-3 rounded-lg bg-purple-50 p-5 border border-purple-100">
            {finalRecommendations.map((recommendation, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-800 font-medium text-xs">{idx + 1}</span>
                </div>
                <p className="text-base text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFeedbackCard;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  TrendingUp, 
  Eye, 
  Search, 
  PlayCircle, 
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface CompetitorAnalysisResultsProps {
  analysisData: any;
}

const CompetitorAnalysisResults: React.FC<CompetitorAnalysisResultsProps> = ({ analysisData }) => {
  if (!analysisData) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Executive Summary */}
      {analysisData.executiveSummary && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
              <Info className="h-6 w-6" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 leading-relaxed">{analysisData.executiveSummary}</p>
            
            {analysisData.finalEvaluation_overallScore && (
              <div className="mt-4 flex items-center gap-4">
                <span className="text-sm font-medium text-blue-700">Puntuación General:</span>
                <Badge className={`text-lg px-3 py-1 ${getScoreColor(analysisData.finalEvaluation_overallScore)}`}>
                  {analysisData.finalEvaluation_overallScore}/10
                </Badge>
                <Progress 
                  value={analysisData.finalEvaluation_overallScore * 10} 
                  className="flex-1 h-3"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategic Alignment */}
      {(analysisData.strategicAlignment_valuePropositionClarityComment || 
        analysisData.strategicAlignment_targetAudienceClarityComment) && 
        renderSection(
          "Alineación Estratégica",
          <Target className="h-5 w-5 text-purple-600" />,
          <div className="space-y-4">
            {analysisData.strategicAlignment_valuePropositionClarityComment && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Propuesta de Valor</h4>
                <p className="text-gray-700">{analysisData.strategicAlignment_valuePropositionClarityComment}</p>
              </div>
            )}
            {analysisData.strategicAlignment_targetAudienceClarityComment && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Audiencia Objetivo</h4>
                <p className="text-gray-700">{analysisData.strategicAlignment_targetAudienceClarityComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Video Structure and Hook Analysis */}
      {analysisData.videoStructureAndPacing_hook_overallEffectivenessScore && 
        renderSection(
          "Estructura del Video y Hook",
          <PlayCircle className="h-5 w-5 text-orange-600" />,
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-800">Efectividad del Hook:</span>
              <Badge className={`${getScoreColor(analysisData.videoStructureAndPacing_hook_overallEffectivenessScore)}`}>
                {analysisData.videoStructureAndPacing_hook_overallEffectivenessScore}/10
              </Badge>
            </div>
            
            {analysisData.videoStructureAndPacing_hook_strengths && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fortalezas
                </h4>
                <p className="text-gray-700">{analysisData.videoStructureAndPacing_hook_strengths}</p>
              </div>
            )}
            
            {analysisData.videoStructureAndPacing_hook_weaknesses && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Debilidades
                </h4>
                <p className="text-gray-700">{analysisData.videoStructureAndPacing_hook_weaknesses}</p>
              </div>
            )}
          </div>
        )
      }

      {/* SEO and Discoverability */}
      {(analysisData.seoAndDiscoverability_hashtagsSEOAnalysis || 
        analysisData.seoAndDiscoverability_keywordIdentificationComment) && 
        renderSection(
          "SEO y Descubrimiento",
          <Search className="h-5 w-5 text-green-600" />,
          <div className="space-y-4">
            {analysisData.seoAndDiscoverability_hashtagsSEOAnalysis && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Análisis de Hashtags</h4>
                <p className="text-gray-700">{analysisData.seoAndDiscoverability_hashtagsSEOAnalysis}</p>
              </div>
            )}
            {analysisData.seoAndDiscoverability_keywordIdentificationComment && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Keywords Identificadas</h4>
                <p className="text-gray-700">{analysisData.seoAndDiscoverability_keywordIdentificationComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Engagement Optimization */}
      {(analysisData.engagementOptimization_watchTimePotentialComment || 
        analysisData.engagementOptimization_viralityFactorsComment) && 
        renderSection(
          "Optimización del Engagement",
          <TrendingUp className="h-5 w-5 text-blue-600" />,
          <div className="space-y-4">
            {analysisData.engagementOptimization_watchTimePotentialComment && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Potencial de Retención</h4>
                <p className="text-gray-700">{analysisData.engagementOptimization_watchTimePotentialComment}</p>
              </div>
            )}
            {analysisData.engagementOptimization_viralityFactorsComment && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Factores de Viralidad</h4>
                <p className="text-gray-700">{analysisData.engagementOptimization_viralityFactorsComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Final Recommendations */}
      {analysisData.finalEvaluation_finalRecommendations && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800">
              <Star className="h-6 w-6" />
              Recomendaciones Finales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisData.finalEvaluation_finalRecommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorAnalysisResults;

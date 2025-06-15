
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
  Info,
  Sparkles
} from 'lucide-react';

interface CompetitorAnalysisResultsProps {
  analysisData: any;
}

const CompetitorAnalysisResults: React.FC<CompetitorAnalysisResultsProps> = ({ analysisData }) => {
  if (!analysisData) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Executive Summary */}
      {analysisData.executiveSummary && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
              <Sparkles className="h-6 w-6" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 leading-relaxed text-lg mb-4">{analysisData.executiveSummary}</p>
            
            {analysisData.finalEvaluation_overallScore && (
              <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-lg p-4">
                <span className="text-sm font-semibold text-blue-700">Puntuación General:</span>
                <Badge className={`text-lg px-4 py-2 border ${getScoreColor(analysisData.finalEvaluation_overallScore)}`}>
                  {analysisData.finalEvaluation_overallScore}/10
                </Badge>
                <Progress 
                  value={analysisData.finalEvaluation_overallScore * 10} 
                  className="flex-1 h-4"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategic Alignment */}
      {(analysisData.strategicAlignment_valuePropositionClarityComment || 
        analysisData.strategicAlignment_targetAudienceClarityComment ||
        analysisData.strategicAlignment_creatorConsistencyComment) && 
        renderSection(
          "Alineación Estratégica",
          <Target className="h-5 w-5 text-purple-600" />,
          <div className="space-y-4">
            {analysisData.strategicAlignment_valuePropositionClarityComment && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2">Propuesta de Valor</h4>
                <p className="text-gray-700">{analysisData.strategicAlignment_valuePropositionClarityComment}</p>
              </div>
            )}
            {analysisData.strategicAlignment_targetAudienceClarityComment && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2">Audiencia Objetivo</h4>
                <p className="text-gray-700">{analysisData.strategicAlignment_targetAudienceClarityComment}</p>
              </div>
            )}
            {analysisData.strategicAlignment_creatorConsistencyComment && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2">Consistencia del Creador</h4>
                <p className="text-gray-700">{analysisData.strategicAlignment_creatorConsistencyComment}</p>
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
            <div className="flex items-center gap-4 mb-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
              <span className="font-semibold text-orange-800">Efectividad del Hook:</span>
              <Badge className={`text-lg px-3 py-1 border ${getScoreColor(analysisData.videoStructureAndPacing_hook_overallEffectivenessScore)}`}>
                {analysisData.videoStructureAndPacing_hook_overallEffectivenessScore}/10
              </Badge>
              <Progress 
                value={analysisData.videoStructureAndPacing_hook_overallEffectivenessScore * 10} 
                className="flex-1 h-3"
              />
            </div>
            
            {analysisData.videoStructureAndPacing_hook_strengths && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fortalezas del Hook
                </h4>
                <p className="text-gray-700">{analysisData.videoStructureAndPacing_hook_strengths}</p>
              </div>
            )}
            
            {analysisData.videoStructureAndPacing_hook_weaknesses && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Debilidades del Hook
                </h4>
                <p className="text-gray-700">{analysisData.videoStructureAndPacing_hook_weaknesses}</p>
              </div>
            )}

            {analysisData.videoStructureAndPacing_valueDelivery_comment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2">Entrega de Valor</h4>
                <p className="text-gray-700">{analysisData.videoStructureAndPacing_valueDelivery_comment}</p>
                {analysisData.videoStructureAndPacing_valueDelivery_qualityScore && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">Calidad:</span>
                    <Badge className={`${getScoreColor(analysisData.videoStructureAndPacing_valueDelivery_qualityScore)}`}>
                      {analysisData.videoStructureAndPacing_valueDelivery_qualityScore}/10
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      {/* SEO and Discoverability */}
      {(analysisData.seoAndDiscoverability_hashtagsSEOAnalysis || 
        analysisData.seoAndDiscoverability_keywordIdentificationComment ||
        analysisData.seoAndDiscoverability_copySEOAnalysis) && 
        renderSection(
          "SEO y Descubrimiento",
          <Search className="h-5 w-5 text-green-600" />,
          <div className="space-y-4">
            {analysisData.seoAndDiscoverability_hashtagsSEOAnalysis && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">Análisis de Hashtags</h4>
                <p className="text-gray-700">{analysisData.seoAndDiscoverability_hashtagsSEOAnalysis}</p>
              </div>
            )}
            {analysisData.seoAndDiscoverability_keywordIdentificationComment && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">Keywords Identificadas</h4>
                <p className="text-gray-700">{analysisData.seoAndDiscoverability_keywordIdentificationComment}</p>
              </div>
            )}
            {analysisData.seoAndDiscoverability_copySEOAnalysis && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">Análisis de Copy SEO</h4>
                <p className="text-gray-700">{analysisData.seoAndDiscoverability_copySEOAnalysis}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Engagement Optimization */}
      {(analysisData.engagementOptimization_watchTimePotentialComment || 
        analysisData.engagementOptimization_viralityFactorsComment ||
        analysisData.engagementOptimization_interactionHierarchyComment) && 
        renderSection(
          "Optimización del Engagement",
          <TrendingUp className="h-5 w-5 text-blue-600" />,
          <div className="space-y-4">
            {analysisData.engagementOptimization_watchTimePotentialComment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Potencial de Retención</h4>
                <p className="text-gray-700">{analysisData.engagementOptimization_watchTimePotentialComment}</p>
              </div>
            )}
            {analysisData.engagementOptimization_viralityFactorsComment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Factores de Viralidad</h4>
                <p className="text-gray-700">{analysisData.engagementOptimization_viralityFactorsComment}</p>
              </div>
            )}
            {analysisData.engagementOptimization_interactionHierarchyComment && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Jerarquía de Interacciones</h4>
                <p className="text-gray-700">{analysisData.engagementOptimization_interactionHierarchyComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Content Type Strategy */}
      {(analysisData.contentTypeStrategy_classification || 
        analysisData.contentTypeStrategy_seriesClarityAndHookComment) && 
        renderSection(
          "Estrategia de Tipo de Contenido",
          <Info className="h-5 w-5 text-indigo-600" />,
          <div className="space-y-4">
            {analysisData.contentTypeStrategy_classification && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h4 className="font-semibold text-indigo-800 mb-2">Clasificación</h4>
                <Badge variant="outline" className="text-indigo-700 border-indigo-300">
                  {analysisData.contentTypeStrategy_classification}
                </Badge>
              </div>
            )}
            {analysisData.contentTypeStrategy_seriesClarityAndHookComment && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <h4 className="font-semibold text-indigo-800 mb-2">Claridad de Serie y Hook</h4>
                <p className="text-gray-700">{analysisData.contentTypeStrategy_seriesClarityAndHookComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Final Recommendations */}
      {analysisData.finalEvaluation_finalRecommendations && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-800">
              <Star className="h-6 w-6" />
              Recomendaciones Finales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisData.finalEvaluation_finalRecommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-green-100">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-green-700 leading-relaxed">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorAnalysisResults;

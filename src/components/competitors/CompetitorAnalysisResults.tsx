
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
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
  if (!analysisData) {
    return (
      <div className="text-center py-16 bg-white">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos de análisis</h3>
        <p className="text-gray-500">No se encontraron datos para mostrar</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="text-gray-600">{icon}</div>
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{content}</div>
    </div>
  );

  return (
    <div className="space-y-8 bg-white">
      {/* Resumen Ejecutivo */}
      {analysisData.executiveSummary && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Resumen Ejecutivo</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">{analysisData.executiveSummary}</p>
          
          {analysisData.finalEvaluation_overallScore && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">Puntuación:</span>
              <Badge className={`px-3 py-1 border ${getScoreColor(analysisData.finalEvaluation_overallScore)}`}>
                {analysisData.finalEvaluation_overallScore}/10
              </Badge>
              <Progress 
                value={analysisData.finalEvaluation_overallScore * 10} 
                className="flex-1 h-2"
              />
            </div>
          )}
        </div>
      )}

      {/* Alineación Estratégica */}
      {(analysisData.strategicAlignment_valuePropositionClarityComment || 
        analysisData.strategicAlignment_targetAudienceClarityComment ||
        analysisData.strategicAlignment_creatorConsistencyComment) && 
        renderSection(
          "Alineación Estratégica",
          <Target className="h-5 w-5" />,
          <div className="space-y-4">
            {analysisData.strategicAlignment_valuePropositionClarityComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Propuesta de Valor</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{analysisData.strategicAlignment_valuePropositionClarityComment}</p>
              </div>
            )}
            {analysisData.strategicAlignment_targetAudienceClarityComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Audiencia Objetivo</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{analysisData.strategicAlignment_targetAudienceClarityComment}</p>
              </div>
            )}
            {analysisData.strategicAlignment_creatorConsistencyComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Consistencia del Creador</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{analysisData.strategicAlignment_creatorConsistencyComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Estructura del Video y Hook */}
      {analysisData.videoStructureAndPacing_hook_overallEffectivenessScore && 
        renderSection(
          "Estructura y Hook",
          <PlayCircle className="h-5 w-5" />,
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
              <span className="font-medium text-gray-900">Efectividad del Hook:</span>
              <Badge className={`px-3 py-1 border ${getScoreColor(analysisData.videoStructureAndPacing_hook_overallEffectivenessScore)}`}>
                {analysisData.videoStructureAndPacing_hook_overallEffectivenessScore}/10
              </Badge>
              <Progress 
                value={analysisData.videoStructureAndPacing_hook_overallEffectivenessScore * 10} 
                className="flex-1 h-2"
              />
            </div>
            
            {analysisData.videoStructureAndPacing_hook_strengths && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fortalezas
                </h4>
                <p className="text-gray-600 text-sm">{analysisData.videoStructureAndPacing_hook_strengths}</p>
              </div>
            )}
            
            {analysisData.videoStructureAndPacing_hook_weaknesses && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Debilidades
                </h4>
                <p className="text-gray-600 text-sm">{analysisData.videoStructureAndPacing_hook_weaknesses}</p>
              </div>
            )}

            {analysisData.videoStructureAndPacing_valueDelivery_comment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Entrega de Valor</h4>
                <p className="text-gray-600 text-sm">{analysisData.videoStructureAndPacing_valueDelivery_comment}</p>
                {analysisData.videoStructureAndPacing_valueDelivery_qualityScore && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Calidad:</span>
                    <Badge className={`text-sm ${getScoreColor(analysisData.videoStructureAndPacing_valueDelivery_qualityScore)}`}>
                      {analysisData.videoStructureAndPacing_valueDelivery_qualityScore}/10
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      {/* SEO y Descubrimiento */}
      {(analysisData.seoAndDiscoverability_hashtagsSEOAnalysis || 
        analysisData.seoAndDiscoverability_keywordIdentificationComment ||
        analysisData.seoAndDiscoverability_copySEOAnalysis) && 
        renderSection(
          "SEO y Descubrimiento",
          <Search className="h-5 w-5" />,
          <div className="space-y-4">
            {analysisData.seoAndDiscoverability_hashtagsSEOAnalysis && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Hashtags</h4>
                <p className="text-gray-600 text-sm">{analysisData.seoAndDiscoverability_hashtagsSEOAnalysis}</p>
              </div>
            )}
            {analysisData.seoAndDiscoverability_keywordIdentificationComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                <p className="text-gray-600 text-sm">{analysisData.seoAndDiscoverability_keywordIdentificationComment}</p>
              </div>
            )}
            {analysisData.seoAndDiscoverability_copySEOAnalysis && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Copy SEO</h4>
                <p className="text-gray-600 text-sm">{analysisData.seoAndDiscoverability_copySEOAnalysis}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Optimización del Engagement */}
      {(analysisData.engagementOptimization_watchTimePotentialComment || 
        analysisData.engagementOptimization_viralityFactorsComment ||
        analysisData.engagementOptimization_interactionHierarchyComment) && 
        renderSection(
          "Optimización del Engagement",
          <TrendingUp className="h-5 w-5" />,
          <div className="space-y-4">
            {analysisData.engagementOptimization_watchTimePotentialComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Retención</h4>
                <p className="text-gray-600 text-sm">{analysisData.engagementOptimization_watchTimePotentialComment}</p>
              </div>
            )}
            {analysisData.engagementOptimization_viralityFactorsComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Viralidad</h4>
                <p className="text-gray-600 text-sm">{analysisData.engagementOptimization_viralityFactorsComment}</p>
              </div>
            )}
            {analysisData.engagementOptimization_interactionHierarchyComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Interacciones</h4>
                <p className="text-gray-600 text-sm">{analysisData.engagementOptimization_interactionHierarchyComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Estrategia de Contenido */}
      {(analysisData.contentTypeStrategy_classification || 
        analysisData.contentTypeStrategy_seriesClarityAndHookComment) && 
        renderSection(
          "Estrategia de Contenido",
          <Info className="h-5 w-5" />,
          <div className="space-y-4">
            {analysisData.contentTypeStrategy_classification && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Tipo de Contenido</h4>
                <Badge variant="outline" className="text-gray-600 border-gray-200">
                  {analysisData.contentTypeStrategy_classification}
                </Badge>
              </div>
            )}
            {analysisData.contentTypeStrategy_seriesClarityAndHookComment && (
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Claridad de Serie</h4>
                <p className="text-gray-600 text-sm">{analysisData.contentTypeStrategy_seriesClarityAndHookComment}</p>
              </div>
            )}
          </div>
        )
      }

      {/* Recomendaciones */}
      {analysisData.finalEvaluation_finalRecommendations && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Recomendaciones</h2>
          </div>
          <div className="space-y-3">
            {analysisData.finalEvaluation_finalRecommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-100">
                <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Si no hay datos para mostrar */}
      {!analysisData.executiveSummary && 
       !analysisData.strategicAlignment_valuePropositionClarityComment &&
       !analysisData.videoStructureAndPacing_hook_overallEffectivenessScore &&
       !analysisData.seoAndDiscoverability_hashtagsSEOAnalysis &&
       !analysisData.engagementOptimization_watchTimePotentialComment &&
       !analysisData.contentTypeStrategy_classification &&
       !analysisData.finalEvaluation_finalRecommendations && (
        <div className="text-center py-16 bg-white">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis incompleto</h3>
          <p className="text-gray-500">Los datos del análisis no están disponibles o están incompletos</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysisResults;

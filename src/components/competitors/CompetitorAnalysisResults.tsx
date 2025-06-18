import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Search, 
  PlayCircle, 
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Users,
  Eye,
  MessageCircle,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';

interface CompetitorAnalysisResultsProps {
  analysisData: any;
}

const CompetitorAnalysisResults: React.FC<CompetitorAnalysisResultsProps> = ({ analysisData }) => {
  if (!analysisData) return null;

  // Check if we have the new structured data
  const hasStructuredData = analysisData.competitor_reel_analysis || analysisData.user_adaptation_proposal;
  
  if (!hasStructuredData) {
    // Fallback to old format
    return <LegacyAnalysisDisplay analysisData={analysisData} />;
  }

  const reelAnalysis = analysisData.competitor_reel_analysis;
  const userAdaptation = analysisData.user_adaptation_proposal;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="viral-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border rounded-lg bg-white">
          <TabsTrigger value="viral-analysis" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
            <BarChart3 className="h-4 w-4" />
            Análisis Viral
          </TabsTrigger>
          <TabsTrigger value="user-adaptation" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
            <Lightbulb className="h-4 w-4" />
            Tu Adaptación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viral-analysis" className="space-y-6">
          {reelAnalysis && <ViralAnalysisDisplay data={reelAnalysis} />}
        </TabsContent>

        <TabsContent value="user-adaptation" className="space-y-6">
          {userAdaptation && <UserAdaptationDisplay data={userAdaptation} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ViralAnalysisDisplay: React.FC<{ data: any }> = ({ data }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header with title and competitor context */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{data.analysisTitle}</h2>
        
        {data.competitorContext && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Competidor</h3>
              <p className="text-sm text-gray-600">@{data.competitorContext.username}</p>
              <p className="text-sm font-medium text-gray-800">{data.competitorContext.fullName}</p>
              <p className="text-sm text-gray-600 mt-1">{data.competitorContext.bioSummary}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Seguidores</h3>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-lg">{formatNumber(data.competitorContext.followers)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance metrics */}
      {data.reelSnapshot && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 border rounded">
                <Eye className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <div className="font-bold text-gray-900">{formatNumber(data.reelSnapshot.views)}</div>
                <div className="text-xs text-gray-700">Views</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="font-bold text-gray-900">{formatNumber(data.reelSnapshot.likes)}</div>
                <div className="text-xs text-gray-700">Likes</div>
              </div>
              <div className="text-center p-3 border rounded">
                <MessageCircle className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <div className="font-bold text-gray-900">{formatNumber(data.reelSnapshot.comments)}</div>
                <div className="text-xs text-gray-700">Comentarios</div>
              </div>
              <div className="text-center p-3 border rounded">
                <TrendingUp className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <div className="font-bold text-gray-900">{data.reelSnapshot.estimatedEngagementRate}</div>
                <div className="text-xs text-gray-700">Engagement</div>
              </div>
            </div>
            
            <div className="p-3 border rounded">
              <h4 className="font-medium text-gray-900 mb-2">Caption</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.reelSnapshot.caption}</p>
            </div>
            
            <div className="mt-3 p-3 border rounded">
              <p className="text-sm text-gray-700">{data.reelSnapshot.performanceRelativeToFollowers}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      {data.executiveSummaryOfCompetitorReel && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{data.executiveSummaryOfCompetitorReel}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      {data.detailedBreakdown && (
        <Card className="border">
          <CardHeader>
            <CardTitle>Análisis Detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hook" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 border rounded-lg bg-white">
                <TabsTrigger value="hook" className="data-[state=active]:bg-gray-100">Hook</TabsTrigger>
                <TabsTrigger value="structure" className="data-[state=active]:bg-gray-100">Estructura</TabsTrigger>
                <TabsTrigger value="engagement" className="data-[state=active]:bg-gray-100">Engagement</TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-gray-100">SEO</TabsTrigger>
                <TabsTrigger value="strategy" className="data-[state=active]:bg-gray-100">Estrategia</TabsTrigger>
              </TabsList>

              <TabsContent value="hook" className="space-y-4">
                {data.detailedBreakdown.videoStructureAndPacing?.hook && (
                  <HookAnalysis hook={data.detailedBreakdown.videoStructureAndPacing.hook} />
                )}
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                {data.detailedBreakdown.videoStructureAndPacing && (
                  <StructureAnalysis structure={data.detailedBreakdown.videoStructureAndPacing} />
                )}
              </TabsContent>

              <TabsContent value="engagement" className="space-y-4">
                {data.detailedBreakdown.engagementOptimizationFactors && (
                  <EngagementAnalysis engagement={data.detailedBreakdown.engagementOptimizationFactors} />
                )}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                {data.detailedBreakdown.seoAndDiscoverabilityFactors && (
                  <SEOAnalysis seo={data.detailedBreakdown.seoAndDiscoverabilityFactors} />
                )}
              </TabsContent>

              <TabsContent value="strategy" className="space-y-4">
                {data.detailedBreakdown.strategicIntent && (
                  <StrategyAnalysis strategy={data.detailedBreakdown.strategicIntent} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Overall Assessment */}
      {data.overallAssessmentOfCompetitorReel && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Evaluación General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.overallAssessmentOfCompetitorReel.keyStrengths && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Fortalezas Clave
                </h4>
                <p className="text-gray-700 text-sm">{data.overallAssessmentOfCompetitorReel.keyStrengths}</p>
              </div>
            )}
            
            {data.overallAssessmentOfCompetitorReel.mainReasonsForPerformance && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Razones del Éxito
                </h4>
                <p className="text-gray-700 text-sm">{data.overallAssessmentOfCompetitorReel.mainReasonsForPerformance}</p>
              </div>
            )}
            
            {data.overallAssessmentOfCompetitorReel.potentialWeaknessesOrMissedOpportunities && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Oportunidades Perdidas
                </h4>
                <p className="text-gray-700 text-sm">{data.overallAssessmentOfCompetitorReel.potentialWeaknessesOrMissedOpportunities}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const UserAdaptationDisplay: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{data.adaptationTitle}</h2>
        <p className="text-gray-700">{data.introduction}</p>
      </div>

      {/* Alignment Analysis */}
      {data.alignmentWithUserProfile && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Alineación con tu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.alignmentWithUserProfile.audienceRelevance && (
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {data.alignmentWithUserProfile.audienceRelevance.isRelevant ? (
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                    )}
                    Relevancia de Audiencia
                  </h4>
                  <p className="text-sm text-gray-700">{data.alignmentWithUserProfile.audienceRelevance.justification}</p>
                </div>
              )}
              
              {data.alignmentWithUserProfile.brandFit && (
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {data.alignmentWithUserProfile.brandFit.isAligned ? (
                      <CheckCircle className="h-4 w-4 text-gray-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                    )}
                    Ajuste de Marca
                  </h4>
                  <p className="text-sm text-gray-700">{data.alignmentWithUserProfile.brandFit.justification}</p>
                </div>
              )}
            </div>
            
            {data.alignmentWithUserProfile.nicheOpportunity && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2">Oportunidad de Nicho</h4>
                <p className="text-gray-700 text-sm">{data.alignmentWithUserProfile.nicheOpportunity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actionable Strategies */}
      {data.actionableAdaptationStrategies && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Estrategias de Adaptación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.actionableAdaptationStrategies).map(([key, strategy]: [string, any]) => (
              <div key={key} className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                {strategy.learningFromCompetitor && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aprendizaje:</span>
                    <p className="text-sm text-gray-600 mt-1">{strategy.learningFromCompetitor}</p>
                  </div>
                )}
                {strategy.suggestionForUser && (
                  <div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tu estrategia:</span>
                    <p className="text-sm text-gray-700 mt-1 font-medium">{strategy.suggestionForUser}</p>
                  </div>
                )}
                {strategy.canAdaptDirectly !== undefined && (
                  <div className="mt-2">
                    <Badge variant={strategy.canAdaptDirectly ? "default" : "secondary"} className="border border-gray-300">
                      {strategy.canAdaptDirectly ? "Adaptación directa posible" : "Requiere modificación"}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Content Blueprint */}
      {data.contentCreationBlueprint && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Blueprint de Contenido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-bold text-gray-900 text-lg mb-2">{data.contentCreationBlueprint.conceptTitleForUserReel}</h3>
              <p className="text-gray-700 mb-3">{data.contentCreationBlueprint.briefDescription}</p>
              <div className="p-3 border rounded">
                <h4 className="font-medium text-gray-900 mb-1">Mensaje Clave:</h4>
                <p className="text-gray-700 text-sm italic">"{data.contentCreationBlueprint.keyMessageForUser}"</p>
              </div>
            </div>
            
            {data.contentCreationBlueprint.suggestedElements && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2">Elementos Sugeridos:</h4>
                <p className="text-gray-700 text-sm">{data.contentCreationBlueprint.suggestedElements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEO Recommendations */}
      {data.seoAndDiscoverabilityForUserContent && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO y Descubribilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.seoAndDiscoverabilityForUserContent.suggestedOptimizedCaption && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2">Caption Optimizada:</h4>
                <p className="text-gray-700 text-sm">{data.seoAndDiscoverabilityForUserContent.suggestedOptimizedCaption}</p>
              </div>
            )}
            
            {data.seoAndDiscoverabilityForUserContent.suggestedOptimizedOnScreenText && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2">Texto en Pantalla:</h4>
                <p className="text-gray-700 text-sm">{data.seoAndDiscoverabilityForUserContent.suggestedOptimizedOnScreenText}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Final Recommendations */}
      {data.finalUserRecommendations && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recomendaciones Finales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.finalUserRecommendations.overallPotentialScoreOfAdaptation && (
              <div className="text-center p-6 border rounded-lg">
                <div className="w-20 h-20 mx-auto mb-3 border rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">{data.finalUserRecommendations.overallPotentialScoreOfAdaptation}</span>
                </div>
                <h3 className="font-medium text-gray-900">Potencial de Adaptación</h3>
              </div>
            )}
            
            {data.finalUserRecommendations.top3ActionableTakeaways && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Top 3 Acciones Clave:</h4>
                {data.finalUserRecommendations.top3ActionableTakeaways.map((takeaway: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-6 h-6 border rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-800 text-sm">{takeaway}</span>
                  </div>
                ))}
              </div>
            )}
            
            {data.finalUserRecommendations.finalWordOfAdvice && (
              <div className="p-4 border rounded">
                <h4 className="font-medium text-gray-900 mb-2">Consejo Final:</h4>
                <p className="text-gray-700 text-sm italic">"{data.finalUserRecommendations.finalWordOfAdvice}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Individual analysis components
const HookAnalysis: React.FC<{ hook: any }> = ({ hook }) => (
  <div className="space-y-4">
    {hook.overallEffectivenessComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Efectividad General</h4>
        <p className="text-gray-700 text-sm">{hook.overallEffectivenessComment}</p>
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hook.strengths && (
        <div className="p-4 border rounded">
          <h4 className="font-medium text-gray-900 mb-2">Fortalezas</h4>
          <p className="text-gray-700 text-sm">{hook.strengths}</p>
        </div>
      )}
      
      {hook.weaknesses && (
        <div className="p-4 border rounded">
          <h4 className="font-medium text-gray-900 mb-2">Debilidades</h4>
          <p className="text-gray-700 text-sm">{hook.weaknesses}</p>
        </div>
      )}
    </div>
    
    {/* Additional hook analysis details */}
    <div className="space-y-3">
      {hook.visualHookAnalysis && (
        <div className="p-3 border rounded">
          <h5 className="font-medium text-gray-900 text-sm mb-1">Análisis Visual</h5>
          <p className="text-gray-700 text-sm">{hook.visualHookAnalysis}</p>
        </div>
      )}
      
      {hook.spokenHookAnalysis && (
        <div className="p-3 border rounded">
          <h5 className="font-medium text-gray-900 text-sm mb-1">Análisis Hablado</h5>
          <p className="text-gray-700 text-sm">{hook.spokenHookAnalysis}</p>
        </div>
      )}
      
      {hook.auditoryHookAnalysis && (
        <div className="p-3 border rounded">
          <h5 className="font-medium text-gray-900 text-sm mb-1">Análisis Auditivo</h5>
          <p className="text-gray-700 text-sm">{hook.auditoryHookAnalysis}</p>
        </div>
      )}
    </div>
  </div>
);

const StructureAnalysis: React.FC<{ structure: any }> = ({ structure }) => (
  <div className="space-y-4">
    {structure.buildUpAndPacingComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Ritmo y Construcción</h4>
        <p className="text-gray-700 text-sm">{structure.buildUpAndPacingComment}</p>
      </div>
    )}
    
    {structure.valueDelivery && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Entrega de Valor</h4>
        <p className="text-gray-700 text-sm">{structure.valueDelivery.comment}</p>
        {structure.valueDelivery.mainFunction && (
          <div className="mt-2">
            <Badge variant="outline" className="border-gray-300">{structure.valueDelivery.mainFunction}</Badge>
          </div>
        )}
      </div>
    )}
    
    {structure.ctaAndEnding?.comment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">CTA y Final</h4>
        <p className="text-gray-700 text-sm">{structure.ctaAndEnding.comment}</p>
      </div>
    )}
  </div>
);

const EngagementAnalysis: React.FC<{ engagement: any }> = ({ engagement }) => (
  <div className="space-y-4">
    {engagement.interactionDriversComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Impulsores de Interacción</h4>
        <p className="text-gray-700 text-sm">{engagement.interactionDriversComment}</p>
      </div>
    )}
    
    {engagement.viralityFactorsComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Factores de Viralidad</h4>
        <p className="text-gray-700 text-sm">{engagement.viralityFactorsComment}</p>
      </div>
    )}
    
    {engagement.watchTimePotentialComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Potencial de Retención</h4>
        <p className="text-gray-700 text-sm">{engagement.watchTimePotentialComment}</p>
      </div>
    )}
  </div>
);

const SEOAnalysis: React.FC<{ seo: any }> = ({ seo }) => (
  <div className="space-y-4">
    {seo.keywordIdentificationComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
        <p className="text-gray-700 text-sm">{seo.keywordIdentificationComment}</p>
      </div>
    )}
    
    {seo.hashtagsEffectivenessComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Hashtags</h4>
        <p className="text-gray-700 text-sm">{seo.hashtagsEffectivenessComment}</p>
      </div>
    )}
    
    {seo.thematicClarityComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Claridad Temática</h4>
        <p className="text-gray-700 text-sm">{seo.thematicClarityComment}</p>
      </div>
    )}
  </div>
);

const StrategyAnalysis: React.FC<{ strategy: any }> = ({ strategy }) => (
  <div className="space-y-4">
    {strategy.apparentTargetAudienceComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Audiencia Objetivo</h4>
        <p className="text-gray-700 text-sm">{strategy.apparentTargetAudienceComment}</p>
      </div>
    )}
    
    {strategy.apparentValuePropositionComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Propuesta de Valor</h4>
        <p className="text-gray-700 text-sm">{strategy.apparentValuePropositionComment}</p>
      </div>
    )}
    
    {strategy.creatorConsistencyComment && (
      <div className="p-4 border rounded">
        <h4 className="font-medium text-gray-900 mb-2">Consistencia del Creador</h4>
        <p className="text-gray-700 text-sm">{strategy.creatorConsistencyComment}</p>
      </div>
    )}
  </div>
);

// Legacy component for backward compatibility
const LegacyAnalysisDisplay: React.FC<{ analysisData: any }> = ({ analysisData }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-gray-700 border-gray-200';
    if (score >= 6) return 'text-gray-700 border-gray-200';
    return 'text-gray-700 border-gray-200';
  };

  const renderSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
        <div className="text-gray-700">{icon}</div>
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">{content}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Legacy format display */}
      {analysisData.executiveSummary && (
        <div className="p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Resumen Ejecutivo</h2>
          </div>
          <p className="text-gray-800 leading-relaxed mb-4">{analysisData.executiveSummary}</p>
          
          {analysisData.finalEvaluation_overallScore && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Puntuación:</span>
              <Badge className={`px-3 py-1 border ${getScoreColor(analysisData.finalEvaluation_overallScore)}`}>
                {analysisData.finalEvaluation_overallScore}/10
              </Badge>
              <Progress 
                value={analysisData.finalEvaluation_overallScore * 10} 
                className="flex-1 h-3"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysisResults;

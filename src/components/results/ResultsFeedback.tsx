
import AIFeedbackCard from "@/components/AIFeedbackCard";
import FeedbackCard from "@/components/FeedbackCard";
import { AIFeedbackResponse } from "@/types";
import { 
  HelpingHand, 
  Lightbulb, 
  Layout, 
  Search, 
  MessageSquare, 
  Gauge, 
  Zap,
  BarChart,
  ArrowUpRight,
  Rocket
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  // Access the new data structure if available
  const fd = feedbackItem.feedback_data;
  
  // Hook analysis
  const hookCategories = fd?.videoStructureAndPacing?.hook ? [
    {
      name: "Efectividad general",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.attentionGrabbingComment || "",
      suggestions: [fd.videoStructureAndPacing.hook.recommendations || ""]
    },
    {
      name: "Hook verbal",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.spokenHookAnalysis || ""
    },
    {
      name: "Hook visual",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.visualHookAnalysis || ""
    },
    {
      name: "Hook auditivo",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.auditoryHookAnalysis || ""
    },
    {
      name: "Fortalezas",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.strengths || ""
    },
    {
      name: "Debilidades",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.weaknesses || "",
    }
  ] : [];
  
  // Structure and value categories
  const structureCategories = [
    ...(fd?.videoStructureAndPacing?.valueDelivery ? [{
      name: "Valor principal",
      score: fd.videoStructureAndPacing.valueDelivery.qualityScore || 0,
      feedback: fd.videoStructureAndPacing.valueDelivery.comment || "",
      suggestions: [fd.videoStructureAndPacing.valueDelivery.recommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.buildUpAndPacingComment ? [{
      name: "Desarrollo y ritmo",
      score: 7,
      feedback: fd.videoStructureAndPacing.buildUpAndPacingComment || "",
      suggestions: [fd.videoStructureAndPacing.buildUpAndPacingRecommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.ctaAndEnding ? [{
      name: "Call to Action (CTA)",
      score: 7,
      feedback: fd.videoStructureAndPacing.ctaAndEnding.comment || "",
      suggestions: [fd.videoStructureAndPacing.ctaAndEnding.recommendations || ""]
    }] : [])
  ];
  
  // SEO categories
  const seoCategories = fd?.seoAndDiscoverability ? [
    {
      name: "Análisis de palabras clave",
      score: 7,
      feedback: fd.seoAndDiscoverability.keywordIdentificationComment || "",
      suggestions: [fd.seoAndDiscoverability.recommendations || ""]
    },
    {
      name: "Claridad temática",
      score: 8,
      feedback: fd.seoAndDiscoverability.thematicClarityComment || ""
    },
    {
      name: "Análisis de copy",
      score: 7,
      feedback: fd.seoAndDiscoverability.copySEOAnalysis || ""
    },
    {
      name: "Análisis de hashtags",
      score: 7,
      feedback: fd.seoAndDiscoverability.hashtagsSEOAnalysis || ""
    },
    {
      name: "Potencial de búsqueda",
      score: 7,
      feedback: fd.seoAndDiscoverability.searchBarPotentialComment || ""
    },
    {
      name: "Texto en pantalla",
      score: 6,
      feedback: fd.seoAndDiscoverability.onScreenTextSEOAanalysis || ""
    },
    {
      name: "Miniatura",
      score: 6,
      feedback: fd.seoAndDiscoverability.coverThumbnailPotentialComment || ""
    },
    {
      name: "Funciones avanzadas",
      score: 6,
      feedback: fd.seoAndDiscoverability.advancedDiscoveryFeaturesComment || ""
    }
  ] : [];
  
  // Native elements categories
  const nativeCategories = fd?.platformNativeElements ? [
    {
      name: "Elementos identificados",
      score: 7,
      feedback: fd.platformNativeElements.identifiedElements || ""
    },
    {
      name: "Efectividad de integración",
      score: 7,
      feedback: fd.platformNativeElements.integrationEffectivenessComment || "",
      suggestions: [fd.platformNativeElements.recommendations || ""]
    }
  ] : [];
  
  // Engagement categories
  const engagementCategories = fd?.engagementOptimization ? [
    {
      name: "Interacción",
      score: 7,
      feedback: fd.engagementOptimization.interactionHierarchyComment || "",
      suggestions: [fd.engagementOptimization.recommendations || ""]
    },
    {
      name: "Tiempo de visualización",
      score: 7,
      feedback: fd.engagementOptimization.watchTimePotentialComment || ""
    },
    {
      name: "Factores de viralidad",
      score: 7,
      feedback: fd.engagementOptimization.viralityFactorsComment || ""
    }
  ] : [];
  
  // Strategic alignment categories
  const strategicCategories = fd?.strategicAlignment ? [
    {
      name: "Consistencia del creador",
      score: 8,
      feedback: fd.strategicAlignment.creatorConsistencyComment || ""
    },
    {
      name: "Claridad de audiencia objetivo",
      score: 8,
      feedback: fd.strategicAlignment.targetAudienceClarityComment || ""
    },
    {
      name: "Propuesta de valor",
      score: 8,
      feedback: fd.strategicAlignment.valuePropositionClarityComment || "",
      suggestions: [fd.strategicAlignment.recommendations || ""]
    }
  ] : [];

  // Content type strategy
  const contentTypeCategories = fd?.contentTypeStrategy ? [
    {
      name: "Clasificación",
      score: 8,
      feedback: `Tipo de contenido: ${fd.contentTypeStrategy.classification || "No especificado"}`,
      suggestions: [fd.contentTypeStrategy.recommendations || ""]
    },
    ...(fd.contentTypeStrategy.seriesClarityAndHookComment ? [{
      name: "Claridad de serie",
      score: 7,
      feedback: fd.contentTypeStrategy.seriesClarityAndHookComment || ""
    }] : []),
    ...(fd.contentTypeStrategy.trendAdaptationCritique ? [{
      name: "Adaptación de tendencias",
      score: 7,
      feedback: fd.contentTypeStrategy.trendAdaptationCritique || ""
    }] : [])
  ] : [];
  
  // Final recommendations
  const finalRecommendations = fd?.finalEvaluation?.finalRecommendations || [];
  
  // Suggested copy content
  const suggestedOptimizedCopy = fd?.seoAndDiscoverability?.suggestedOptimizedCopy || "";
  const suggestedOptimizedOnScreenText = fd?.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "";
  
  return (
    <div className="space-y-6">
      <AIFeedbackCard feedback={feedbackItem} />
      
      {/* Sugerencias de Copy Optimizado */}
      {(suggestedOptimizedCopy || suggestedOptimizedOnScreenText) && (
        <div className="bg-white rounded-lg p-5 border shadow-sm mt-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
            <ArrowUpRight className="mr-2 text-blue-600" /> 
            Copy y Texto Sugerido
          </h3>
          
          {suggestedOptimizedCopy && (
            <div className="mb-4">
              <h4 className="font-medium text-slate-700 mb-2">Copy optimizado sugerido:</h4>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-slate-800 whitespace-pre-wrap">{suggestedOptimizedCopy}</p>
              </div>
            </div>
          )}
          
          {suggestedOptimizedOnScreenText && (
            <div>
              <h4 className="font-medium text-slate-700 mb-2">Texto en pantalla sugerido:</h4>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-slate-800 font-medium text-center">{suggestedOptimizedOnScreenText}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Análisis Detallado</h2>
        
        <Tabs defaultValue="hook" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6 w-full">
            <TabsTrigger value="hook" className="flex gap-1 items-center">
              <Rocket className="h-4 w-4" /> Hook
            </TabsTrigger>
            <TabsTrigger value="estructura" className="flex gap-1 items-center">
              <Layout className="h-4 w-4" /> Estructura
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex gap-1 items-center">
              <Search className="h-4 w-4" /> SEO
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex gap-1 items-center">
              <MessageSquare className="h-4 w-4" /> Engagement
            </TabsTrigger>
            <TabsTrigger value="estrategia" className="flex gap-1 items-center">
              <BarChart className="h-4 w-4" /> Estrategia
            </TabsTrigger>
            <TabsTrigger value="elementos" className="flex gap-1 items-center">
              <Gauge className="h-4 w-4" /> Elementos
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white p-5 rounded-lg border mt-2">
            <TabsContent value="hook" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Rocket className="mr-2 text-amber-500" /> Análisis del Hook
              </h3>
              <p className="text-slate-600 mb-4">Un hook efectivo es crucial para captar la atención en los primeros segundos y evitar que los usuarios deslicen.</p>
              {hookCategories.length > 0 ? (
                <FeedbackCard
                  title="Evaluación del Hook"
                  overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
                  categories={hookCategories}
                  icon={<Rocket className="h-5 w-5 text-amber-500" />}
                  accentColor="bg-amber-50 border-amber-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis del hook.</p>
              )}
            </TabsContent>
            
            <TabsContent value="estructura" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Layout className="mr-2 text-indigo-600" /> Estructura y Valor
              </h3>
              <p className="text-slate-600 mb-4">La estructura óptima mantiene al espectador interesado mientras se entrega el valor principal del contenido.</p>
              {structureCategories.length > 0 ? (
                <FeedbackCard
                  title="Evaluación de Estructura"
                  overallScore={fd?.videoStructureAndPacing?.valueDelivery?.qualityScore || 7}
                  categories={structureCategories}
                  icon={<Layout className="h-5 w-5 text-indigo-600" />}
                  accentColor="bg-indigo-50 border-indigo-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de estructura.</p>
              )}
            </TabsContent>
            
            <TabsContent value="seo" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="mr-2 text-blue-600" /> SEO y Descubribilidad
              </h3>
              <p className="text-slate-600 mb-4">La optimización para motores de búsqueda aumenta la visibilidad de tu contenido en la plataforma.</p>
              {seoCategories.length > 0 ? (
                <FeedbackCard
                  title="SEO y Descubribilidad"
                  overallScore={7}
                  categories={seoCategories}
                  icon={<Search className="h-5 w-5 text-blue-600" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de SEO.</p>
              )}
            </TabsContent>
            
            <TabsContent value="engagement" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-2 text-green-600" /> Potencial de Engagement
              </h3>
              <p className="text-slate-600 mb-4">El engagement determina cómo tu contenido se distribuye y cuántas interacciones recibe.</p>
              {engagementCategories.length > 0 ? (
                <FeedbackCard
                  title="Potencial de Engagement"
                  overallScore={7}
                  categories={engagementCategories}
                  icon={<MessageSquare className="h-5 w-5 text-green-600" />}
                  accentColor="bg-green-50 border-green-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de engagement.</p>
              )}
            </TabsContent>
            
            <TabsContent value="estrategia" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart className="mr-2 text-purple-600" /> Alineación Estratégica
              </h3>
              <p className="text-slate-600 mb-4">La alineación estratégica asegura que tu contenido refuerza tu marca personal y conecta con tu audiencia.</p>
              <div className="space-y-6">
                {strategicCategories.length > 0 ? (
                  <FeedbackCard
                    title="Alineación Estratégica"
                    overallScore={8}
                    categories={strategicCategories}
                    icon={<BarChart className="h-5 w-5 text-purple-600" />}
                    accentColor="bg-purple-50 border-purple-100"
                  />
                ) : (
                  <p>No hay datos disponibles para la alineación estratégica.</p>
                )}
                
                {contentTypeCategories.length > 0 && (
                  <FeedbackCard
                    title="Estrategia de Tipo de Contenido"
                    overallScore={8}
                    categories={contentTypeCategories}
                    icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
                    accentColor="bg-yellow-50 border-yellow-100"
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="elementos" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Gauge className="mr-2 text-orange-600" /> Elementos Nativos
              </h3>
              <p className="text-slate-600 mb-4">Los elementos nativos de la plataforma ayudan a que tu contenido se sienta más natural y auténtico.</p>
              {nativeCategories.length > 0 ? (
                <FeedbackCard
                  title="Elementos Nativos de la Plataforma"
                  overallScore={7}
                  categories={nativeCategories}
                  icon={<Gauge className="h-5 w-5 text-orange-600" />}
                  accentColor="bg-orange-50 border-orange-100"
                />
              ) : (
                <p>No hay datos disponibles para elementos nativos.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {finalRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200 shadow-sm mt-8">
          <h3 className="text-xl font-semibold mb-4 text-amber-800 flex items-center">
            <Zap className="mr-2 text-amber-600" /> 
            Recomendaciones Finales
          </h3>
          <ul className="space-y-4">
            {finalRecommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3">
                <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-800 font-semibold text-sm">{idx + 1}</span>
                </div>
                <p className="text-slate-800">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsFeedback;

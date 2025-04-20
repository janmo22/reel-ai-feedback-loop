
import AIFeedbackCard from "@/components/AIFeedbackCard";
import FeedbackCard from "@/components/FeedbackCard";
import { AIFeedbackResponse } from "@/types";
import { 
  Rocket, 
  Layout, 
  Search, 
  MessageSquare,
  BarChart,
  Gauge,
  Star
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuggestedCopy from "./SuggestedCopy";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  const fd = feedbackItem.feedback_data;
  
  // Hook subcategories with scores displayed
  const hookSubcategories = fd?.videoStructureAndPacing?.hook ? [
    {
      name: "Efectividad general del hook",
      feedback: `Puntuación: ${fd.videoStructureAndPacing.hook.overallEffectivenessScore}/10`,
      isHighlighted: true
    },
    {
      name: "Hook verbal",
      feedback: fd.videoStructureAndPacing.hook.attentionGrabbingComment || ""
    },
    {
      name: "Hook visual",
      feedback: fd.videoStructureAndPacing.hook.visualHookAnalysis || ""
    },
    {
      name: "Hook auditivo",
      feedback: fd.videoStructureAndPacing.hook.auditoryHookAnalysis || ""
    },
    {
      name: "Claridad y simplicidad",
      feedback: fd.videoStructureAndPacing.hook.clarityAndSimplicityComment || ""
    },
    {
      name: "Comunicación de beneficio",
      feedback: fd.videoStructureAndPacing.hook.viewerBenefitCommunicationComment || ""
    },
    {
      name: "Autenticidad",
      feedback: fd.videoStructureAndPacing.hook.authenticityFeelComment || ""
    },
    {
      name: "Disrupción de patrón",
      feedback: fd.videoStructureAndPacing.hook.patternDisruptionComment || ""
    }
  ] : [];
  
  // Hook strengths and weaknesses with improved layout
  const hookStrengthsWeaknesses = fd?.videoStructureAndPacing?.hook ? [
    {
      name: "Fortalezas",
      feedback: fd.videoStructureAndPacing.hook.strengths || "",
      isHighlighted: true
    },
    {
      name: "Debilidades",
      feedback: fd.videoStructureAndPacing.hook.weaknesses || "",
      isHighlighted: true,
      className: "whitespace-pre-wrap" // Mejora el formato del texto
    }
  ] : [];
  
  // Structure and value categories with quality score
  const structureCategories = [
    ...(fd?.videoStructureAndPacing?.valueDelivery ? [{
      name: "Calidad de entrega",
      feedback: `Puntuación: ${fd.videoStructureAndPacing.valueDelivery.qualityScore}/10`,
      isHighlighted: true
    }, {
      name: "Valor principal",
      feedback: fd.videoStructureAndPacing.valueDelivery.comment || "",
      suggestions: [fd.videoStructureAndPacing.valueDelivery.recommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.buildUpAndPacingComment ? [{
      name: "Desarrollo y ritmo",
      feedback: fd.videoStructureAndPacing.buildUpAndPacingComment || "",
      suggestions: [fd.videoStructureAndPacing.buildUpAndPacingRecommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.ctaAndEnding ? [{
      name: "Call to Action (CTA)",
      feedback: fd.videoStructureAndPacing.ctaAndEnding.comment || "",
      suggestions: [fd.videoStructureAndPacing.ctaAndEnding.recommendations || ""]
    }] : [])
  ];
  
  // SEO categories
  const seoCategories = fd?.seoAndDiscoverability ? [
    {
      name: "Claridad temática",
      feedback: fd.seoAndDiscoverability.thematicClarityComment || ""
    },
    {
      name: "Análisis de palabras clave",
      feedback: fd.seoAndDiscoverability.keywordIdentificationComment || ""
    },
    {
      name: "Análisis de hashtags",
      feedback: fd.seoAndDiscoverability.hashtagsSEOAnalysis || ""
    },
    {
      name: "Potencial de búsqueda",
      feedback: fd.seoAndDiscoverability.searchBarPotentialComment || ""
    },
    {
      name: "Esto te va a dar más Flow",
      feedback: fd.seoAndDiscoverability.recommendations || "",
      isHighlighted: true
    }
  ] : [];
  
  // Strategic alignment categories
  const strategicCategories = fd?.strategicAlignment ? [
    {
      name: "Consistencia del creador",
      feedback: fd.strategicAlignment.creatorConsistencyComment || ""
    },
    {
      name: "Claridad de audiencia objetivo",
      feedback: fd.strategicAlignment.targetAudienceClarityComment || ""
    },
    {
      name: "Propuesta de valor",
      feedback: fd.strategicAlignment.valuePropositionClarityComment || "",
      suggestions: [fd.strategicAlignment.recommendations || ""]
    }
  ] : [];

  // Content type strategy
  const contentTypeCategories = fd?.contentTypeStrategy ? [
    {
      name: "Clasificación",
      feedback: `Tipo de contenido: ${fd.contentTypeStrategy.classification || "No especificado"}`,
      suggestions: [fd.contentTypeStrategy.recommendations || ""]
    },
    ...(fd.contentTypeStrategy.seriesClarityAndHookComment ? [{
      name: "Claridad de serie",
      feedback: fd.contentTypeStrategy.seriesClarityAndHookComment || ""
    }] : []),
    ...(fd.contentTypeStrategy.trendAdaptationCritique ? [{
      name: "Adaptación de tendencias",
      feedback: fd.contentTypeStrategy.trendAdaptationCritique || ""
    }] : [])
  ] : [];
  
  // Engagement categories without scores
  const engagementCategories = fd?.engagementOptimization ? [
    {
      name: "Interacción",
      feedback: fd.engagementOptimization.interactionHierarchyComment || "",
      suggestions: [fd.engagementOptimization.recommendations || ""]
    },
    {
      name: "Tiempo de visualización",
      feedback: fd.engagementOptimization.watchTimePotentialComment || ""
    },
    {
      name: "Factores de viralidad",
      feedback: fd.engagementOptimization.viralityFactorsComment || ""
    }
  ] : [];
  
  // Get suggested copy content
  const suggestedOptimizedCopy = fd?.seoAndDiscoverability?.suggestedOptimizedCopy || "";
  const suggestedOptimizedOnScreenText = fd?.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "";
  
  return (
    <div className="space-y-10">
      <AIFeedbackCard feedback={feedbackItem} />
      
      <div className="mt-10">
        <Tabs defaultValue="hook" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto bg-transparent p-0 mb-8 w-full">
            <TabsTrigger value="hook" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Rocket className="h-4 w-4" /> Hook
            </TabsTrigger>
            <TabsTrigger value="estructura" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Layout className="h-4 w-4" /> Estructura
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Search className="h-4 w-4" /> SEO
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Star className="h-4 w-4" /> Engagement
            </TabsTrigger>
            <TabsTrigger value="estrategia" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <BarChart className="h-4 w-4" /> Estrategia
            </TabsTrigger>
            <TabsTrigger value="elementos" className="flex gap-1 items-center border rounded-md bg-white data-[state=active]:bg-blue-50 data-[state=active]:border-blue-200">
              <Gauge className="h-4 w-4" /> Elementos
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <TabsContent value="hook" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Rocket className="mr-3 text-blue-500" /> Análisis del Hook
              </h3>
              <p className="text-slate-600 mb-6">Un hook efectivo es crucial para captar la atención en los primeros segundos y evitar que los usuarios deslicen.</p>
              
              {/* Hook subcategories without scores */}
              {hookSubcategories.length > 0 && (
                <div className="mb-8">
                  <FeedbackCard
                    title="Detalles del Hook"
                    overallScore={feedbackItem.overallEvaluation.score}
                    categories={hookSubcategories}
                    showScores={false}
                    icon={<Rocket className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                </div>
              )}
              
              {/* Hook strengths and weaknesses */}
              {hookStrengthsWeaknesses.length > 0 && (
                <div>
                  <FeedbackCard
                    title="Fortalezas y Debilidades"
                    overallScore={feedbackItem.overallEvaluation.score}
                    categories={hookStrengthsWeaknesses}
                    showScores={false}
                    highlightCategories={true}
                    icon={<Rocket className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                </div>
              )}
            </TabsContent>
            
            
            <TabsContent value="estructura" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Layout className="mr-3 text-blue-500" /> Estructura y Valor
              </h3>
              <p className="text-slate-600 mb-6">La estructura óptima mantiene al espectador interesado mientras se entrega el valor principal del contenido.</p>
              {structureCategories.length > 0 ? (
                <FeedbackCard
                  title="Evaluación de Estructura"
                  overallScore={feedbackItem.overallEvaluation.score}
                  categories={structureCategories}
                  showScores={false}
                  icon={<Layout className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de estructura.</p>
              )}
            </TabsContent>
            
            <TabsContent value="seo" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="mr-3 text-blue-500" /> SEO y Descubribilidad
              </h3>
              <p className="text-slate-600 mb-6">La optimización para motores de búsqueda aumenta la visibilidad de tu contenido en la plataforma.</p>
              {seoCategories.length > 0 ? (
                <FeedbackCard
                  title="SEO y Descubribilidad"
                  overallScore={feedbackItem.overallEvaluation.score}
                  categories={seoCategories}
                  showScores={false}
                  highlightCategories={true}
                  icon={<Search className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de SEO.</p>
              )}
              
              {(suggestedOptimizedCopy || suggestedOptimizedOnScreenText) && (
                <div className="mt-8">
                  <SuggestedCopy
                    suggestedText={suggestedOptimizedOnScreenText}
                    suggestedCopy={suggestedOptimizedCopy}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="engagement" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Star className="mr-3 text-blue-500" /> Potencial de Engagement
              </h3>
              <p className="text-slate-600 mb-6">El engagement determina cómo tu contenido se distribuye y cuántas interacciones recibe.</p>
              {engagementCategories.length > 0 ? (
                <FeedbackCard
                  title="Potencial de Engagement"
                  overallScore={feedbackItem.overallEvaluation.score}
                  categories={engagementCategories}
                  showScores={false}
                  icon={<Star className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de engagement.</p>
              )}
            </TabsContent>
            
            <TabsContent value="estrategia" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart className="mr-3 text-blue-500" /> Alineación Estratégica
              </h3>
              <p className="text-slate-600 mb-6">La alineación estratégica asegura que tu contenido refuerza tu marca personal y conecta con tu audiencia.</p>
              <div className="space-y-8">
                {strategicCategories.length > 0 ? (
                  <FeedbackCard
                    title="Alineación Estratégica"
                    overallScore={feedbackItem.overallEvaluation.score}
                    categories={strategicCategories}
                    showScores={false}
                    icon={<BarChart className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                ) : (
                  <p>No hay datos disponibles para la alineación estratégica.</p>
                )}
                
                {contentTypeCategories.length > 0 && (
                  <FeedbackCard
                    title="Estrategia de Tipo de Contenido"
                    overallScore={feedbackItem.overallEvaluation.score}
                    categories={contentTypeCategories}
                    showScores={false}
                    icon={<Star className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="elementos" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Gauge className="mr-3 text-blue-500" /> Elementos Nativos
              </h3>
              <p className="text-slate-600 mb-6">Los elementos nativos de la plataforma ayudan a que tu contenido se sienta más natural y auténtico.</p>
              {fd?.platformNativeElements ? (
                <FeedbackCard
                  title="Elementos Nativos de la Plataforma"
                  overallScore={feedbackItem.overallEvaluation.score}
                  categories={[
                    {
                      name: "Elementos identificados",
                      feedback: fd.platformNativeElements.identifiedElements || "",
                    },
                    {
                      name: "Efectividad de integración",
                      feedback: fd.platformNativeElements.integrationEffectivenessComment || "",
                      suggestions: [fd.platformNativeElements.recommendations || ""]
                    }
                  ]}
                  showScores={false}
                  icon={<Gauge className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para elementos nativos.</p>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ResultsFeedback;

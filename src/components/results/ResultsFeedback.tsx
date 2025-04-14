
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
  Lightbulb
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuggestedCopy from "./SuggestedCopy";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  // Access the new data structure if available
  const fd = feedbackItem.feedback_data;
  
  // Hook analysis - now with only overall score and no scores for subcategories
  const hookData = fd?.videoStructureAndPacing?.hook;
  const hookMainCategory = hookData ? [
    {
      name: "Efectividad general",
      score: hookData.overallEffectivenessScore || 0,
      feedback: hookData.attentionGrabbingComment || "",
      suggestions: [hookData.recommendations || ""]
    }
  ] : [];
  
  // Hook subcategories without scores
  const hookSubcategories = hookData ? [
    {
      name: "Hook verbal",
      feedback: hookData.spokenHookAnalysis || ""
    },
    {
      name: "Hook visual",
      feedback: hookData.visualHookAnalysis || ""
    },
    {
      name: "Hook auditivo",
      feedback: hookData.auditoryHookAnalysis || ""
    },
    {
      name: "Claridad y simplicidad",
      feedback: hookData.clarityAndSimplicityComment || ""
    },
    {
      name: "Comunicación de beneficio",
      feedback: hookData.viewerBenefitCommunicationComment || ""
    },
    {
      name: "Autenticidad",
      feedback: hookData.authenticityFeelComment || ""
    },
    {
      name: "Disrupción de patrón",
      feedback: hookData.patternDisruptionComment || ""
    }
  ] : [];
  
  // Hook strengths and weaknesses as separate sections
  const hookStrengthsWeaknesses = hookData ? [
    {
      name: "Fortalezas",
      feedback: hookData.strengths || "",
      isHighlighted: true
    },
    {
      name: "Debilidades",
      feedback: hookData.weaknesses || "",
      isHighlighted: true
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
      score: 7, // Sin puntuación específica según los nuevos campos
      feedback: fd.videoStructureAndPacing.buildUpAndPacingComment || "",
      suggestions: [fd.videoStructureAndPacing.buildUpAndPacingRecommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.ctaAndEnding ? [{
      name: "Call to Action (CTA)",
      score: 7, // Sin puntuación específica según los nuevos campos
      feedback: fd.videoStructureAndPacing.ctaAndEnding.comment || "",
      suggestions: [fd.videoStructureAndPacing.ctaAndEnding.recommendations || ""]
    }] : [])
  ];
  
  // SEO categories - Con los nuevos campos especificados
  const seoCategories = fd?.seoAndDiscoverability ? [
    {
      name: "Claridad temática",
      score: fd.seoAndDiscoverability.thematicClarityScore || 8,
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
      score: fd.seoAndDiscoverability.searchBarPotentialScore || 7,
      feedback: fd.seoAndDiscoverability.searchBarPotentialComment || ""
    },
    {
      name: "Esto te va a dar más Flow",
      feedback: fd.seoAndDiscoverability.trucoFlowComment || 
        "Texto no visible que se coloca dentro del editor de la plataforma para mejorar la indexación y distribución del contenido.",
      isHighlighted: true
    }
  ] : [];
  
  // Native elements categories - with overall score
  const nativeCategories = fd?.platformNativeElements ? [
    {
      name: "Elementos nativos de la plataforma",
      score: fd.platformNativeElements.overallEffectivenessScore || 7,
      feedback: fd.platformNativeElements.integrationEffectivenessComment || "",
      suggestions: [fd.platformNativeElements.recommendations || ""]
    }
  ] : [];
  
  // Engagement categories - all with scores
  const engagementCategories = fd?.engagementOptimization ? [
    {
      name: "Interacción",
      score: fd.engagementOptimization.interactionHierarchyScore || 7,
      feedback: fd.engagementOptimization.interactionHierarchyComment || "",
      suggestions: [fd.engagementOptimization.recommendations || ""]
    },
    {
      name: "Tiempo de visualización",
      score: fd.engagementOptimization.watchTimePotentialScore || 7,
      feedback: fd.engagementOptimization.watchTimePotentialComment || ""
    },
    {
      name: "Factores de viralidad",
      score: fd.engagementOptimization.viralityFactorsScore || 7,
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

  // Content type strategy - no scores
  const contentTypeCategories = fd?.contentTypeStrategy ? [
    {
      name: "Clasificación",
      feedback: `Tipo de contenido: ${
        fd.contentTypeStrategy.classification === "Serie" ? "Content Serie" : "Contenido Suelto"
      }`,
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
  
  // Suggested copy content
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
              <MessageSquare className="h-4 w-4" /> Engagement
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
              
              {/* Main hook score */}
              {hookMainCategory.length > 0 && (
                <div className="mb-8">
                  <FeedbackCard
                    title="Evaluación del Hook"
                    overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
                    categories={hookMainCategory}
                    icon={<Rocket className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                </div>
              )}
              
              {/* Hook subcategories without scores */}
              {hookSubcategories.length > 0 && (
                <div className="mb-8">
                  <FeedbackCard
                    title="Detalles del Hook"
                    overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
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
                    overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
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
                  overallScore={fd?.videoStructureAndPacing?.valueDelivery?.qualityScore || 7}
                  categories={structureCategories}
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
                  overallScore={fd?.seoAndDiscoverability?.thematicClarityScore || 7}
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
                <MessageSquare className="mr-3 text-blue-500" /> Potencial de Engagement
              </h3>
              <p className="text-slate-600 mb-6">El engagement determina cómo tu contenido se distribuye y cuántas interacciones recibe.</p>
              {engagementCategories.length > 0 ? (
                <FeedbackCard
                  title="Potencial de Engagement"
                  overallScore={(fd?.engagementOptimization?.watchTimePotentialScore || 0 + 
                                fd?.engagementOptimization?.interactionHierarchyScore || 0 + 
                                fd?.engagementOptimization?.viralityFactorsScore || 0) / 3 || 7}
                  categories={engagementCategories}
                  icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
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
                    overallScore={8}
                    categories={strategicCategories}
                    icon={<BarChart className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                ) : (
                  <p>No hay datos disponibles para la alineación estratégica.</p>
                )}
                
                {contentTypeCategories.length > 0 && (
                  <FeedbackCard
                    title="Estrategia de Tipo de Contenido"
                    overallScore={8}
                    categories={contentTypeCategories}
                    showScores={false}
                    icon={<Lightbulb className="h-5 w-5 text-blue-500" />}
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
              {nativeCategories.length > 0 ? (
                <FeedbackCard
                  title="Elementos Nativos de la Plataforma"
                  overallScore={fd?.platformNativeElements?.overallEffectivenessScore || 7}
                  categories={nativeCategories}
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

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
  Copy,
  Lightbulb
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SuggestedCopy from "./SuggestedCopy";

const ResultsFeedback = ({ feedbackItem }: { feedbackItem: AIFeedbackResponse }) => {
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
  
  // Suggested copy content
  const suggestedOptimizedCopy = fd?.seoAndDiscoverability?.suggestedOptimizedCopy || "";
  const suggestedOptimizedOnScreenText = fd?.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "";
  
  return (
    <div className="space-y-10">
      <AIFeedbackCard feedback={feedbackItem} />
      
      <div className="mt-10">
        <Tabs defaultValue="hook" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto bg-transparent p-0 mb-8 w-full">
            <TabsTrigger 
              value="hook" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <Rocket className="h-4 w-4 text-blue-600" /> Hook
            </TabsTrigger>
            <TabsTrigger 
              value="estructura" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <Layout className="h-4 w-4 text-blue-600" /> Estructura
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <Search className="h-4 w-4 text-blue-600" /> SEO
            </TabsTrigger>
            <TabsTrigger 
              value="engagement" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <MessageSquare className="h-4 w-4 text-blue-600" /> Engagement
            </TabsTrigger>
            <TabsTrigger 
              value="estrategia" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <BarChart className="h-4 w-4 text-blue-600" /> Estrategia
            </TabsTrigger>
            <TabsTrigger 
              value="elementos" 
              className="flex gap-1 items-center border rounded-md bg-blue-50 border-blue-200 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300"
            >
              <Gauge className="h-4 w-4 text-blue-600" /> Elementos
            </TabsTrigger>
          </TabsList>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
            <TabsContent value="hook" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Rocket className="mr-3 text-blue-500" /> Análisis del Hook
              </h3>
              <p className="text-slate-600 mb-6">Un hook efectivo es crucial para captar la atención en los primeros segundos y evitar que los usuarios deslicen.</p>
              {hookCategories.length > 0 ? (
                <FeedbackCard
                  title="Evaluación del Hook"
                  overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
                  categories={hookCategories}
                  icon={<Rocket className="h-5 w-5 text-purple-500" />}
                  accentColor="bg-purple-50 border-purple-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis del hook.</p>
              )}
            </TabsContent>
            
            <TabsContent value="estructura" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
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
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Search className="mr-3 text-blue-500" /> SEO y Descubribilidad
              </h3>
              <p className="text-slate-600 mb-6">La optimización para motores de búsqueda aumenta la visibilidad de tu contenido en la plataforma.</p>
              {seoCategories.length > 0 ? (
                <FeedbackCard
                  title="SEO y Descubribilidad"
                  overallScore={7}
                  categories={seoCategories}
                  icon={<Search className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-purple-50 border-purple-100"
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
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <MessageSquare className="mr-3 text-blue-500" /> Potencial de Engagement
              </h3>
              <p className="text-slate-600 mb-6">El engagement determina cómo tu contenido se distribuye y cuántas interacciones recibe.</p>
              {engagementCategories.length > 0 ? (
                <FeedbackCard
                  title="Potencial de Engagement"
                  overallScore={7}
                  categories={engagementCategories}
                  icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
                  accentColor="bg-blue-50 border-blue-100"
                />
              ) : (
                <p>No hay datos disponibles para el análisis de engagement.</p>
              )}
            </TabsContent>
            
            <TabsContent value="estrategia" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
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
                    icon={<Lightbulb className="h-5 w-5 text-purple-500" />}
                    accentColor="bg-purple-50 border-purple-100"
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="elementos" className="mt-0">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
                <Gauge className="mr-3 text-blue-500" /> Elementos Nativos
              </h3>
              <p className="text-slate-600 mb-6">Los elementos nativos de la plataforma ayudan a que tu contenido se sienta más natural y auténtico.</p>
              {nativeCategories.length > 0 ? (
                <FeedbackCard
                  title="Elementos Nativos de la Plataforma"
                  overallScore={7}
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

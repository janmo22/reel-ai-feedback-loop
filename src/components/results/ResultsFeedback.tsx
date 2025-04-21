
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
import ScoreBubble from "@/components/ui/score-bubble";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Diccionario básico para tooltips (moved here from FeedbackCard for better contextual info and extensibility)
const attributeDescriptions: Record<string, string> = {
  "Efectividad general del hook": "Mide qué tan efectivo es el inicio del video para captar la atención.",
  "Hook verbal": "Evaluación del comentario o frase principal dicha al inicio.",
  "Hook visual": "Análisis de los elementos visuales que captan la atención.",
  "Hook auditivo": "Elementos de audio/sound design utilizados para atraer al espectador.",
  "Claridad y simplicidad": "Qué tan directo y comprensible es el mensaje inicial.",
  "Comunicación de beneficio": "Si el espectador entiende qué valor recibirá.",
  "Autenticidad": "Grado de naturalidad y cercanía trasmitida.",
  "Disrupción de patrón": "Uso de recursos que rompen la expectativa y evitan el scroll.",
  "Fortalezas": "", // no tooltip
  "Debilidades": "", // no tooltip
  "Calidad de entrega": "Calidad en la presentación y transmisión del valor.",
  "Valor principal": "Comentario sobre el aporte de valor clave del video.",
  "Desarrollo y ritmo": "Fluidez y ritmo de la secuencia de partes del video.",
  "Call to Action (CTA)": "Calidad y claridad de la llamada a la acción.",
  "Claridad temática": "Precisión en el enfoque del tema presentado.",
  "Análisis de palabras clave": "Revisión sobre uso de palabras que ayudan al SEO.",
  "Análisis de hashtags": "Uso y calidad de los hashtags aplicados.",
  "Potencial de búsqueda": "Capacidad del video de aparecer en búsquedas relevantes.",
  "Esto te va a dar más Flow": "Ocultar el texto en los primeros segundos del vídeo desde la aplicación propia para que el algoritmo te indexe mejor.",
  "Consistencia del creador": "Nivel de coherencia con el contenido previo del creador.",
  "Claridad de audiencia objetivo": "Si queda clara la audiencia a la que va dirigido.",
  "Propuesta de valor": "Claridad y fuerza de la propuesta de valor.",
  "Clasificación": "Tipo de contenido según su propósito principal.",
  "Claridad de serie": "Si pertenece a una serie, claridad de concepto.",
  "Adaptación de tendencias": "Qué tanto aprovecha tendencias actuales.",
  "Interacción": "Capacidad de provocar comentarios, likes o compartir.",
  "Tiempo de visualización": "Capacidad de mantener viendo el contenido completo.",
  "Factores de viralidad": "Recursos y técnicas que aumentan la opción de viralizar.",
  "Elementos identificados": "Elementos nativos de la plataforma identificados.",
  "Efectividad de integración": "Cómo de bien se integran estos elementos.",
};


interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  const fd = feedbackItem.feedback_data;

  // Removed "Efectividad general del hook" completely (not used anymore)

  const hookSubcategories = fd?.videoStructureAndPacing?.hook ? [
    // We'll add tooltip icons here for each mini attribute except the "Fortalezas" / "Debilidades"
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
      className: "whitespace-pre-wrap"
    }
  ] : [];

  // Removed "Calidad de entrega" from structureCategories:
  const structureCategories = [
    ...(fd?.videoStructureAndPacing?.valueDelivery ? [
      // Omit Calidad de entrega now
      {
        name: "Valor principal",
        feedback: fd.videoStructureAndPacing.valueDelivery.comment || "",
        suggestions: [fd.videoStructureAndPacing.valueDelivery.recommendations || ""]
      }
    ] : []),
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
      // Text replaced with fixed string as requested
      feedback: "Ocultar el texto en los primeros segundos del vídeo desde la aplicación propia para que el algoritmo te indexe mejor",
      isHighlighted: true
    }
  ] : [];

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

  const suggestedOptimizedCopy = fd?.seoAndDiscoverability?.suggestedOptimizedCopy || "";
  const suggestedOptimizedOnScreenText = fd?.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "";

  // Helper component for rendering a category title with tooltip info icon (except for no-tooltips category names)
  const CategoryTitle = ({ name }: { name: string }) => {
    if (!attributeDescriptions[name] || attributeDescriptions[name].trim() === "") {
      return <>{name}</>;
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 tabIndex={0} className="font-medium text-slate-800 flex items-center gap-1 cursor-pointer select-none">
              {name}
              <InfoIcon className="text-blue-500 h-4 w-4" />
            </h4>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <span className="text-xs text-slate-700">{attributeDescriptions[name]}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Info icon component reused for tooltips (using Info from lucide-react)
  const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );

  // Render the categories with the updated title component
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
              <div className="flex items-center mb-4 gap-3">
                <h3 className="text-xl font-semibold flex items-center m-0">
                  <Rocket className="mr-3 text-blue-500" /> Análisis del Hook
                </h3>
                {/* No hookScore here anymore */}
              </div>
              <p className="text-slate-600 mb-6">Un hook efectivo es crucial para captar la atención en los primeros segundos y evitar que los usuarios deslicen.</p>
              
              {hookSubcategories.length > 0 && (
                <div className="mb-8">
                  <FeedbackCard
                    title="Detalles del Hook"
                    overallScore={feedbackItem.overallEvaluation.score}
                    categories={hookSubcategories.map(cat => ({
                      ...cat,
                      // Add custom title with tooltip except for Fortalezas/Debilidades handled separately
                      name: (
                        <CategoryTitle key={cat.name} name={cat.name} />
                      ),
                    }))}
                    showScores={false}
                    icon={<Rocket className="h-5 w-5 text-blue-500" />}
                    accentColor="bg-blue-50 border-blue-100"
                  />
                </div>
              )}
              
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
              <div className="flex items-center mb-4 gap-3">
                <h3 className="text-xl font-semibold flex items-center m-0">
                  <Layout className="mr-3 text-blue-500" /> Estructura y Valor
                </h3>
                {Number.isFinite(fd?.videoStructureAndPacing?.valueDelivery?.qualityScore) && (
                  <ScoreBubble 
                    score={fd.videoStructureAndPacing.valueDelivery.qualityScore} 
                    size="sm" 
                    showLabel={false} 
                  />
                )}
              </div>
              <p className="text-slate-600 mb-6">La estructura óptima mantiene al espectador interesado mientras se entrega el valor principal del contenido.</p>
              {structureCategories.length > 0 ? (
                <FeedbackCard
                  title="Evaluación de Estructura"
                  overallScore={feedbackItem.overallEvaluation.score}
                  categories={structureCategories.map(cat => ({
                    ...cat,
                    name: <CategoryTitle key={cat.name} name={cat.name} />,
                  }))}
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
                  categories={seoCategories.map(cat => ({
                    ...cat,
                    name: <CategoryTitle key={cat.name} name={cat.name} />,
                  }))}
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
                  categories={engagementCategories.map(cat => ({
                    ...cat,
                    name: <CategoryTitle key={cat.name} name={cat.name} />,
                  }))}
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
                    categories={strategicCategories.map(cat => ({
                      ...cat,
                      name: <CategoryTitle key={cat.name} name={cat.name} />,
                    }))}
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
                    categories={contentTypeCategories.map(cat => ({
                      ...cat,
                      name: <CategoryTitle key={cat.name} name={cat.name} />,
                    }))}
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
                  ].map(cat => ({
                    ...cat,
                    name: <CategoryTitle key={cat.name} name={cat.name} />,
                  }))}
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

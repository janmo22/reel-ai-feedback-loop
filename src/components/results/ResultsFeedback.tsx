
import AIFeedbackCard from "@/components/AIFeedbackCard";
import FeedbackCard from "@/components/FeedbackCard";
import { AIFeedbackResponse } from "@/types";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  // Access the new data structure if available
  const fd = feedbackItem.feedback_data;
  
  // Prepare categories for feedback cards using the new data structure
  
  // Hook analysis
  const hookCategories = fd?.videoStructureAndPacing?.hook ? [
    {
      name: "General",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.attentionGrabbingComment || ""
    },
    {
      name: "Verbal",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.spokenHookAnalysis || ""
    },
    {
      name: "Visual",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: fd.videoStructureAndPacing.hook.visualHookAnalysis || ""
    },
    {
      name: "Fortalezas y Debilidades",
      score: fd.videoStructureAndPacing.hook.overallEffectivenessScore || 0,
      feedback: `Fortalezas: ${fd.videoStructureAndPacing.hook.strengths || ""}. Debilidades: ${fd.videoStructureAndPacing.hook.weaknesses || ""}.`,
      suggestions: [fd.videoStructureAndPacing.hook.recommendations || ""]
    }
  ] : null;
  
  // Structure and value categories
  const structureCategories = [
    ...(fd?.videoStructureAndPacing?.valueDelivery ? [{
      name: "Valor principal",
      score: fd.videoStructureAndPacing.valueDelivery.qualityScore || 0,
      feedback: fd.videoStructureAndPacing.valueDelivery.comment || "",
      suggestions: [fd.videoStructureAndPacing.valueDelivery.recommendations || ""]
    }] : []),
    ...(fd?.videoStructureAndPacing?.buildUpAndPacingComment ? [{
      name: "Desarrollo",
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
      name: "Hashtags y SEO",
      score: 7,
      feedback: fd.seoAndDiscoverability.hashtagsSEOAnalysis || ""
    },
    {
      name: "Copy sugerido",
      score: 9,
      feedback: fd.seoAndDiscoverability.suggestedOptimizedCopy || ""
    }
  ] : null;
  
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
  ] : null;
  
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
  ] : null;
  
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
  ] : null;
  
  return (
    <div className="space-y-6">
      <AIFeedbackCard feedback={feedbackItem} />
      
      <div className="mt-6 space-y-6">
        {/* Hook Analysis */}
        {hookCategories && hookCategories.length > 0 && (
          <FeedbackCard
            title="Evaluación del Hook"
            overallScore={fd?.videoStructureAndPacing?.hook?.overallEffectivenessScore || 0}
            categories={hookCategories}
          />
        )}
        
        {/* Structure and Value Analysis */}
        {structureCategories.length > 0 && (
          <FeedbackCard
            title="Evaluación de Valor y Estructura"
            overallScore={fd?.videoStructureAndPacing?.valueDelivery?.qualityScore || 0}
            categories={structureCategories}
          />
        )}
        
        {/* Strategic Alignment */}
        {strategicCategories && strategicCategories.length > 0 && (
          <FeedbackCard
            title="Alineación Estratégica"
            overallScore={8}
            categories={strategicCategories}
          />
        )}
        
        {/* SEO Analysis */}
        {seoCategories && seoCategories.length > 0 && (
          <FeedbackCard
            title="SEO y Descubribilidad"
            overallScore={7}
            categories={seoCategories}
          />
        )}
        
        {/* Native Elements */}
        {nativeCategories && nativeCategories.length > 0 && (
          <FeedbackCard
            title="Elementos Nativos de la Plataforma"
            overallScore={7}
            categories={nativeCategories}
          />
        )}
        
        {/* Engagement Analysis */}
        {engagementCategories && engagementCategories.length > 0 && (
          <FeedbackCard
            title="Potencial de Engagement"
            overallScore={7}
            categories={engagementCategories}
          />
        )}
      </div>
    </div>
  );
};

export default ResultsFeedback;

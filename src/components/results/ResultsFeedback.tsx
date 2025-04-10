
import AIFeedbackCard from "@/components/AIFeedbackCard";
import FeedbackCard from "@/components/FeedbackCard";
import { AIFeedbackResponse } from "@/types";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  // Create a default structure for missing properties
  const feedback = {
    ...feedbackItem,
    structure: feedbackItem.structure || {
      hook: {
        general: "No disponible",
        spoken: "No disponible",
        visual: "No disponible",
        strengths: "No disponible",
        weaknesses: "No disponible",
        score: 0,
        auditory: "No disponible",
        clarity: "No disponible",
        feel: "No disponible",
        invitation: "No disponible",
        patternBreak: "No disponible"
      },
      buildUp: "No disponible",
      value: {
        comment: "No disponible",
        score: 0,
        function: "No disponible"
      },
      cta: "No disponible"
    },
    seo: feedbackItem.seo || {
      keywordAnalysis: "No disponible",
      clarity: "No disponible",
      suggestedText: "No disponible",
      suggestedCopy: "No disponible"
    },
    nativeCodes: feedbackItem.nativeCodes || "No disponible",
    engagementPotential: feedbackItem.engagementPotential || {
      interaction: "No disponible",
      watchTime: "No disponible"
    }
  };
  
  return (
    <div className="space-y-6">
      <AIFeedbackCard feedback={feedbackItem} />
      
      {/* Only show additional feedback cards if structure is available */}
      {feedback.structure && (
        <div className="mt-6 space-y-6">
          {feedback.structure.hook && (
            <FeedbackCard
              title="Evaluación del Hook"
              overallScore={feedback.structure.hook.score}
              categories={[
                {
                  name: "General",
                  score: feedback.structure.hook.score,
                  feedback: feedback.structure.hook.general
                },
                {
                  name: "Verbal",
                  score: feedback.structure.hook.score,
                  feedback: feedback.structure.hook.spoken
                },
                {
                  name: "Visual",
                  score: feedback.structure.hook.score,
                  feedback: feedback.structure.hook.visual
                },
                {
                  name: "Fortalezas y Debilidades",
                  score: feedback.structure.hook.score,
                  feedback: `Fortalezas: ${feedback.structure.hook.strengths}. Debilidades: ${feedback.structure.hook.weaknesses}.`
                }
              ]}
            />
          )}
          
          {(feedback.structure.value || feedback.structure.buildUp || feedback.structure.cta) && (
            <FeedbackCard
              title="Evaluación de Valor y Estructura"
              overallScore={feedback.structure.value?.score || 0}
              categories={[
                ...(feedback.structure.value ? [{
                  name: "Valor principal",
                  score: feedback.structure.value.score,
                  feedback: feedback.structure.value.comment,
                  suggestions: [`Función: ${feedback.structure.value.function}`]
                }] : []),
                ...(feedback.structure.buildUp ? [{
                  name: "Desarrollo",
                  score: 7,
                  feedback: feedback.structure.buildUp
                }] : []),
                ...(feedback.structure.cta ? [{
                  name: "Call to Action (CTA)",
                  score: 6,
                  feedback: feedback.structure.cta
                }] : [])
              ]}
            />
          )}
          
          <FeedbackCard
            title="SEO y Códigos Nativos"
            overallScore={7}
            categories={[
              {
                name: "Análisis de palabras clave",
                score: 7,
                feedback: feedback.seo.keywordAnalysis
              },
              {
                name: "Claridad temática",
                score: 8,
                feedback: feedback.seo.clarity
              },
              {
                name: "Códigos nativos",
                score: 7,
                feedback: feedback.nativeCodes
              }
            ]}
          />
          
          <FeedbackCard
            title="Potencial de Engagement"
            overallScore={7}
            categories={[
              {
                name: "Interacción",
                score: 7,
                feedback: feedback.engagementPotential.interaction
              },
              {
                name: "Tiempo de visualización",
                score: 7,
                feedback: feedback.engagementPotential.watchTime
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsFeedback;

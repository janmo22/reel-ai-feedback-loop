
import AIFeedbackCard from "@/components/AIFeedbackCard";
import FeedbackCard from "@/components/FeedbackCard";
import { AIFeedbackResponse } from "@/types";

interface ResultsFeedbackProps {
  feedbackItem: AIFeedbackResponse;
}

const ResultsFeedback = ({ feedbackItem }: ResultsFeedbackProps) => {
  // Create a default structure for missing properties
  const feedbackWithStructure = {
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
    }
  };
  
  return (
    <div className="space-y-6">
      <AIFeedbackCard feedback={feedbackItem} />
      
      {/* Only show additional feedback cards if structure is available */}
      {feedbackWithStructure.structure && (
        <div className="mt-6 space-y-6">
          {feedbackWithStructure.structure.hook && (
            <FeedbackCard
              title="Evaluación del Hook"
              overallScore={feedbackWithStructure.structure.hook.score}
              categories={[
                {
                  name: "General",
                  score: feedbackWithStructure.structure.hook.score,
                  feedback: feedbackWithStructure.structure.hook.general
                },
                {
                  name: "Verbal",
                  score: feedbackWithStructure.structure.hook.score,
                  feedback: feedbackWithStructure.structure.hook.spoken
                },
                {
                  name: "Visual",
                  score: feedbackWithStructure.structure.hook.score,
                  feedback: feedbackWithStructure.structure.hook.visual
                },
                {
                  name: "Fortalezas y Debilidades",
                  score: feedbackWithStructure.structure.hook.score,
                  feedback: `Fortalezas: ${feedbackWithStructure.structure.hook.strengths}. Debilidades: ${feedbackWithStructure.structure.hook.weaknesses}.`
                }
              ]}
            />
          )}
          
          {(feedbackWithStructure.structure.value || feedbackWithStructure.structure.buildUp || feedbackWithStructure.structure.cta) && (
            <FeedbackCard
              title="Evaluación de Valor y Estructura"
              overallScore={feedbackWithStructure.structure.value?.score || 0}
              categories={[
                ...(feedbackWithStructure.structure.value ? [{
                  name: "Valor principal",
                  score: feedbackWithStructure.structure.value.score,
                  feedback: feedbackWithStructure.structure.value.comment,
                  suggestions: [`Función: ${feedbackWithStructure.structure.value.function}`]
                }] : []),
                ...(feedbackWithStructure.structure.buildUp ? [{
                  name: "Desarrollo",
                  score: 7,
                  feedback: feedbackWithStructure.structure.buildUp
                }] : []),
                ...(feedbackWithStructure.structure.cta ? [{
                  name: "Call to Action (CTA)",
                  score: 6,
                  feedback: feedbackWithStructure.structure.cta
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
                feedback: feedbackItem.seo.keywordAnalysis
              },
              {
                name: "Claridad temática",
                score: 8,
                feedback: feedbackItem.seo.clarity
              },
              {
                name: "Códigos nativos",
                score: 7,
                feedback: feedbackItem.nativeCodes
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
                feedback: feedbackItem.engagementPotential.interaction
              },
              {
                name: "Tiempo de visualización",
                score: 7,
                feedback: feedbackItem.engagementPotential.watchTime
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsFeedback;

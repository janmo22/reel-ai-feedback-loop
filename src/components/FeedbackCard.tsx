
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Info } from "lucide-react";
import ScoreBubble from "@/components/ui/score-bubble";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

// Diccionario para tooltips (sin calidad de entrega ni efectividad general del hook, y "Esto te va a dar más Flow" con el texto especial según lo pedido)
const attributeDescriptions: Record<string, string> = {
  "Hook verbal": "Evaluación del comentario o frase principal dicha al inicio.",
  "Hook visual": "Análisis de los elementos visuales que captan la atención.",
  "Hook auditivo": "Elementos de audio/sound design utilizados para atraer al espectador.",
  "Claridad y simplicidad": "Qué tan directo y comprensible es el mensaje inicial.",
  "Comunicación de beneficio": "Si el espectador entiende qué valor recibirá.",
  "Autenticidad": "Grado de naturalidad y cercanía trasmitida.",
  "Disrupción de patrón": "Uso de recursos que rompen la expectativa y evitan el scroll.",
  "Valor principal": "Comentario sobre el aporte de valor clave del video.",
  "Desarrollo y ritmo": "Fluidez y ritmo de la secuencia de partes del video.",
  "Call to Action (CTA)": "Calidad y claridad de la llamada a la acción.",
  "Claridad temática": "Precisión en el enfoque del tema presentado.",
  "Análisis de palabras clave": "Revisión sobre uso de palabras que ayudan al SEO.",
  "Análisis de hashtags": "Uso y calidad de los hashtags aplicados.",
  "Potencial de búsqueda": "Capacidad del video de aparecer en búsquedas relevantes.",
  "Esto te va a dar más Flow": "Ocultar el texto en los primeros segundos del vídeo desde la aplicación propia para que el algoritmo te indexe mejor",
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

interface FeedbackCardProps {
  title: string;
  overallScore: number;
  categories: {
    name: string | React.ReactNode;
    score?: number;
    feedback: string;
    suggestions?: string[];
    isHighlighted?: boolean;
    className?: string;
  }[];
  isDetailed?: boolean;
  showScores?: boolean;
  highlightCategories?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
}

const FeedbackCard = ({
  title,
  overallScore,
  categories,
  isDetailed = true,
  showScores = true,
  highlightCategories = false,
  icon,
  accentColor = "bg-slate-50 border-slate-100"
}: FeedbackCardProps) => {
  const [expanded, setExpanded] = useState(isDetailed);
  return (
    <Card className="border shadow-sm">
      <CardHeader className={`pb-3 ${expanded ? accentColor : ''}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div>
              <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
            </div>
          </div>
          {showScores && (
            <ScoreBubble score={overallScore} size="sm" />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Button
          variant="ghost"
          className="flex w-full justify-between items-center mb-2 py-1 hover:bg-slate-50"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="font-medium text-sm text-slate-600">{expanded ? "Ocultar detalles" : "Ver detalles"}</span>
          {expanded ? <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            : <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
        </Button>

        {expanded && (
          <div className="space-y-5 mt-4 animate-in fade-in-50 duration-300">
            <TooltipProvider>
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`border-b last:border-b-0 pb-5 last:pb-0 mb-5 last:mb-0 ${
                    category.isHighlighted || (highlightCategories && typeof category.name === "string" && category.name === "Esto te va a dar más Flow")
                      ? "bg-blue-50 p-4 rounded-md border border-blue-100"
                      : ""
                  } ${category.className ?? ""}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      {/* Mini atributo: si NO es fortalezas/debilidades y hay descripción, pone tooltip */}
                      {(typeof category.name === "string" && 
                        attributeDescriptions[category.name] && 
                        category.name !== "Fortalezas" && 
                        category.name !== "Debilidades"
                      ) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0} className="flex items-center gap-1 cursor-pointer select-none">
                              <h4 className="font-medium text-slate-800">{category.name}</h4>
                              <Info className="text-blue-500 h-4 w-4 inline-block" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <span className="text-xs text-slate-700">{attributeDescriptions[category.name]}</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        // Si es fortalezas/debilidades o ReactNode personalizado, solo muestra el texto/título sin tooltip
                        typeof category.name !== "string"
                          ? category.name
                          : <h4 className="font-medium text-slate-800">{category.name}</h4>
                      )}
                    </div>
                    {showScores && category.score !== undefined && (
                      <ScoreBubble score={category.score} size="sm" showLabel={false} />
                    )}
                  </div>

                  <p className="text-sm text-slate-700 mb-4">{category.feedback}</p>

                  {category.suggestions && category.suggestions.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-md mt-4 border-l-2 border-blue-500">
                      <h5 className="text-sm font-medium text-slate-700 mb-2">Recomendaciones:</h5>
                      <ul className="space-y-3">
                        {category.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm flex gap-2">
                            <ThumbsUp size={14} className="text-blue-600 flex-shrink-0 mt-1" />
                            <span className="text-slate-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;


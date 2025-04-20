
import { cn } from "@/lib/utils";

interface ScoreBubbleProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const ScoreBubble = ({ 
  score, 
  maxScore = 10, 
  size = "md",
  showLabel = true 
}: ScoreBubbleProps) => {
  const getScoreColor = (score: number) => {
    const normalizedScore = (score / maxScore) * 10;
    if (normalizedScore >= 8) return "bg-gradient-to-br from-green-400 to-green-600";
    if (normalizedScore >= 6) return "bg-gradient-to-br from-blue-400 to-blue-600";
    return "bg-gradient-to-br from-red-400 to-red-600";
  };

  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-xl",
    lg: "w-20 h-20 text-2xl"
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold shadow-lg",
          "transform hover:scale-105 transition-all duration-200",
          "border-2 border-white",
          getScoreColor(score),
          sizeClasses[size]
        )}
      >
        <span>{score}</span>
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600 font-medium">
          {score}/{maxScore}
        </span>
      )}
    </div>
  );
};

export default ScoreBubble;

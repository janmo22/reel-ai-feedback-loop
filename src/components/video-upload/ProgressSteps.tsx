
import React from "react";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: "upload" | "processing" | "complete";
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center space-x-4 sm:space-x-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "upload" 
              ? "bg-flow-electric text-white" 
              : "bg-flow-electric/20 text-flow-electric"
          }`}>
            {currentStep !== "upload" ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>1</span>
            )}
          </div>
          <span className="ml-2 font-medium text-sm font-satoshi">Subir</span>
        </div>
        
        <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "processing" 
              ? "bg-flow-electric text-white" 
              : currentStep === "complete" 
                ? "bg-flow-electric/20 text-flow-electric" 
                : "bg-muted text-muted-foreground"
          }`}>
            {currentStep === "complete" ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>2</span>
            )}
          </div>
          <span className={`ml-2 font-medium text-sm font-satoshi ${
            currentStep === "upload" ? "text-muted-foreground" : ""
          }`}>Procesando</span>
        </div>
        
        <div className="h-0.5 w-12 sm:w-24 bg-border"></div>
        
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === "complete" 
              ? "bg-flow-electric text-white" 
              : "bg-muted text-muted-foreground"
          }`}>
            <span>3</span>
          </div>
          <span className={`ml-2 font-medium text-sm font-satoshi ${
            currentStep !== "complete" ? "text-muted-foreground" : ""
          }`}>Completado</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;

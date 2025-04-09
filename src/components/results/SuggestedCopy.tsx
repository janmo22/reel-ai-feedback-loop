
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SuggestedCopyProps {
  suggestedText: string;
  suggestedCopy: string;
}

const SuggestedCopy = ({ suggestedText, suggestedCopy }: SuggestedCopyProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(`${suggestedText}\n\n${suggestedCopy}`);
    setCopied(true);
    toast({
      title: "Copiado al portapapeles",
      description: "El texto ha sido copiado correctamente."
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-muted/30 rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">Copia sugerida para publicación</h3>
      <div className="bg-white p-4 rounded-md border mb-4 dark:bg-sidebar-accent">
        <p className="font-medium text-lg mb-2">{suggestedText}</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestedCopy}</p>
      </div>
      <Button onClick={handleCopy}>
        {copied ? "¡Copiado!" : "Copiar texto"}
      </Button>
    </div>
  );
};

export default SuggestedCopy;

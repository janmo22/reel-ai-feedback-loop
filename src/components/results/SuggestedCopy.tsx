
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check } from "lucide-react";

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
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center">Copy sugerido</h3>
      <div className="bg-slate-50 p-5 rounded-md border mb-5">
        <p className="font-medium text-md mb-3">{suggestedText}</p>
        <p className="text-sm text-slate-600 whitespace-pre-wrap">{suggestedCopy}</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCopy}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check size={14} />
            Copiado
          </>
        ) : (
          <>
            <Copy size={14} />
            Copiar texto
          </>
        )}
      </Button>
    </div>
  );
};

export default SuggestedCopy;

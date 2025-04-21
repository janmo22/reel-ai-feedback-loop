
import React from "react";
import { FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryHeaderProps {
  onNavigateToUpload?: () => void;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = ({ onNavigateToUpload }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 text-flow-blue mb-2">
      <FileVideo className="h-5 w-5" />
      <span className="text-sm font-medium">Historial</span>
    </div>

    <div className="flex flex-col md:flex-row md:items-end justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-tt-travels font-bold text-gray-900">
          Historial de Videos
        </h1>
        <p className="text-gray-500">
          Revisa y gestiona todos tus videos analizados
        </p>
      </div>
      {onNavigateToUpload && (
        <div className="mt-4 md:mt-0">
          <Button onClick={onNavigateToUpload}>Subir nuevo video</Button>
        </div>
      )}
    </div>
  </div>
);

export default HistoryHeader;


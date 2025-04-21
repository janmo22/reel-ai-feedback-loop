
import React from "react";
import { FileVideo } from "lucide-react";

interface HistoryHeaderProps {
  onNavigateToUpload?: () => void;
}

const HistoryHeader: React.FC<HistoryHeaderProps> = () => (
  <div className="mb-8">
    <div className="flex items-center gap-2 text-flow-blue mb-2">
      <FileVideo className="h-5 w-5" />
      <span className="text-sm font-medium">Historial</span>
    </div>

    <div>
      <h1 className="text-2xl md:text-3xl font-tt-travels font-bold text-gray-900">
        Historial de Videos
      </h1>
      <p className="text-gray-500 md:block hidden">
        Revisa y gestiona todos tus videos analizados
      </p>
    </div>
  </div>
);

export default HistoryHeader;

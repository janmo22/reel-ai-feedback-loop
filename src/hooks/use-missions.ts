
import { useState } from "react";

export function useMissions() {
  const [missions, setMissions] = useState<string[]>([]);
  
  const handleMissionChange = (mission: string) => {
    setMissions(prev => {
      if (prev.includes(mission)) {
        return prev.filter(m => m !== mission);
      } else {
        return [...prev, mission];
      }
    });
  };
  
  return {
    missions,
    handleMissionChange,
    resetMissions: () => setMissions([])
  };
}


import React, { useEffect, useState } from "react";
import { Video, Sparkles, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    videosAnalyzed: "0",
    recommendations: "0",
    improvements: "0%",
    videosLoading: true,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Get videos count
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('id')
          .eq('user_id', user.id);

        if (videosError) throw videosError;
        
        // Get feedback count (recommendations)
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('id, overall_score')
          .in('video_id', videos?.map(v => v.id) || []);
          
        if (feedbackError) throw feedbackError;
        
        // Calculate improvement percentage
        let improvementPercent = "0%";
        if (feedback && feedback.length > 1) {
          const scores = feedback.map(f => f.overall_score || 0);
          const firstScore = scores[scores.length - 1]; // Oldest
          const lastScore = scores[0]; // Most recent
          
          if (firstScore && lastScore && firstScore > 0) {
            const improvement = ((lastScore - firstScore) / firstScore) * 100;
            improvementPercent = `${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}%`;
          }
        }
        
        setStats({
          videosAnalyzed: videos?.length.toString() || "0",
          recommendations: feedback?.length.toString() || "0",
          improvements: improvementPercent,
          videosLoading: false,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setStats(prev => ({...prev, videosLoading: false}));
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatCard 
        icon={<Video className="h-4 w-4" />}
        title="Videos analizados"
        value={stats.videosLoading ? "..." : stats.videosAnalyzed}
        trend={stats.videosLoading ? "cargando..." : `${stats.videosAnalyzed} este mes`}
        trendUp={true}
      />
      
      <StatCard 
        icon={<Sparkles className="h-4 w-4" />}
        title="Recomendaciones"
        value={stats.videosLoading ? "..." : stats.recommendations}
        trend={stats.videosLoading ? "cargando..." : "ideas para mejorar"}
        trendUp={true}
      />
      
      <StatCard 
        icon={<TrendingUp className="h-4 w-4" />}
        title="Mejoras detectadas"
        value={stats.videosLoading ? "..." : stats.improvements}
        trend={stats.videosLoading ? "cargando..." : "vs reels anteriores"}
        trendUp={stats.improvements.includes('+') || stats.improvements === "0%"}
      />
    </div>
  );
};

export default DashboardAnalytics;

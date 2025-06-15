
import React, { useEffect, useState } from "react";
import { Video, Users, Target, BarChart3, TrendingUp, FileVideo } from "lucide-react";
import StatCard from "./StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DashboardAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    videosAnalyzed: "0",
    competitorsTracked: "0",
    createdVideos: "0",
    strategiesDefined: "0",
    improvements: "0%",
    totalAnalysis: "0",
    loading: true,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Videos analizados
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('id')
          .eq('user_id', user.id);

        if (videosError) throw videosError;

        // Competidores tracked
        const { data: competitors, error: competitorsError } = await supabase
          .from('competitors')
          .select('id')
          .eq('user_id', user.id);

        if (competitorsError) throw competitorsError;

        // Videos creados
        const { data: createdVideos, error: createdVideosError } = await supabase
          .from('created_videos')
          .select('id')
          .eq('user_id', user.id);

        if (createdVideosError) throw createdVideosError;

        // Estrategias definidas
        const { data: strategies, error: strategiesError } = await supabase
          .from('user_mission')
          .select('id')
          .eq('user_id', user.id);

        if (strategiesError) throw strategiesError;

        // Análisis totales (feedback + competitor analysis + my profile analysis)
        const { data: feedback, error: feedbackError } = await supabase
          .from('feedback')
          .select('id, overall_score')
          .in('video_id', videos?.map(v => v.id) || []);

        if (feedbackError) throw feedbackError;

        const { data: competitorAnalysis, error: competitorAnalysisError } = await supabase
          .from('competitor_analysis')
          .select('id')
          .in('competitor_video_id', 
            (await supabase
              .from('competitor_videos')
              .select('id')
              .in('competitor_id', competitors?.map(c => c.id) || [])
            ).data?.map(cv => cv.id) || []
          );

        if (competitorAnalysisError) throw competitorAnalysisError;

        // Calcular mejoras
        let improvementPercent = "0%";
        if (feedback && feedback.length > 1) {
          const scores = feedback.map(f => f.overall_score || 0);
          const firstScore = scores[scores.length - 1];
          const lastScore = scores[0];
          
          if (firstScore && lastScore && firstScore > 0) {
            const improvement = ((lastScore - firstScore) / firstScore) * 100;
            improvementPercent = `${improvement > 0 ? '+' : ''}${improvement.toFixed(0)}%`;
          }
        }

        const totalAnalysisCount = (feedback?.length || 0) + (competitorAnalysis?.length || 0);
        
        setStats({
          videosAnalyzed: videos?.length.toString() || "0",
          competitorsTracked: competitors?.length.toString() || "0",
          createdVideos: createdVideos?.length.toString() || "0",
          strategiesDefined: strategies?.length.toString() || "0",
          improvements: improvementPercent,
          totalAnalysis: totalAnalysisCount.toString(),
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setStats(prev => ({...prev, loading: false}));
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        icon={<Video className="h-4 w-4" />}
        title="Videos analizados"
        value={stats.loading ? "..." : stats.videosAnalyzed}
        trend={stats.loading ? "cargando..." : `${stats.videosAnalyzed} videos subidos`}
        trendUp={true}
      />
      
      <StatCard 
        icon={<Users className="h-4 w-4" />}
        title="Competidores"
        value={stats.loading ? "..." : stats.competitorsTracked}
        trend={stats.loading ? "cargando..." : "perfiles monitoreados"}
        trendUp={true}
      />
      
      <StatCard 
        icon={<FileVideo className="h-4 w-4" />}
        title="Videos creados"
        value={stats.loading ? "..." : stats.createdVideos}
        trend={stats.loading ? "cargando..." : "guiones desarrollados"}
        trendUp={true}
      />
      
      <StatCard 
        icon={<Target className="h-4 w-4" />}
        title="Estrategias"
        value={stats.loading ? "..." : stats.strategiesDefined}
        trend={stats.loading ? "cargando..." : "estrategias definidas"}
        trendUp={true}
      />
      
      <StatCard 
        icon={<BarChart3 className="h-4 w-4" />}
        title="Análisis totales"
        value={stats.loading ? "..." : stats.totalAnalysis}
        trend={stats.loading ? "cargando..." : "insights generados"}
        trendUp={true}
      />
      
      <StatCard 
        icon={<TrendingUp className="h-4 w-4" />}
        title="Mejoras detectadas"
        value={stats.loading ? "..." : stats.improvements}
        trend={stats.loading ? "cargando..." : "vs videos anteriores"}
        trendUp={stats.improvements.includes('+') || stats.improvements === "0%"}
      />
    </div>
  );
};

export default DashboardAnalytics;

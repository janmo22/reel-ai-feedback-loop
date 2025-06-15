
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
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Videos Analizados</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.videosAnalyzed}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : `${stats.videosAnalyzed} videos procesados`}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Competidores</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.competitorsTracked}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : "perfiles monitoreados"}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <FileVideo className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Videos Creados</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.createdVideos}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : "guiones desarrollados"}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Estrategias</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.strategiesDefined}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : "estrategias definidas"}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Análisis Totales</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.totalAnalysis}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : "insights generados"}
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm hover:shadow-lg transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Mejoras</h3>
            <div className="text-3xl font-bold text-gray-900">
              {stats.loading ? "..." : stats.improvements}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {stats.loading ? "cargando..." : "vs videos anteriores"}
        </p>
      </div>
    </div>
  );
};

export default DashboardAnalytics;


import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DashboardInsights: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<{
    recentCompetitor: string | null;
    lastScore: number | null;
    strategiesCount: number;
    loading: boolean;
  }>({
    recentCompetitor: null,
    lastScore: null,
    strategiesCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user) return;

      try {
        // Último competidor agregado
        const { data: lastCompetitor } = await supabase
          .from('competitors')
          .select('instagram_username')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Último score de análisis
        const { data: videos } = await supabase
          .from('videos')
          .select('id')
          .eq('user_id', user.id);

        const { data: lastFeedback } = await supabase
          .from('feedback')
          .select('overall_score')
          .in('video_id', videos?.map(v => v.id) || [])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Estrategias definidas
        const { data: strategies } = await supabase
          .from('user_mission')
          .select('id')
          .eq('user_id', user.id);

        setInsights({
          recentCompetitor: lastCompetitor?.instagram_username || null,
          lastScore: lastFeedback?.overall_score || null,
          strategiesCount: strategies?.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching insights:", error);
        setInsights(prev => ({ ...prev, loading: false }));
      }
    };

    fetchInsights();
  }, [user]);

  if (insights.loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-blue-100 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Lightbulb className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Insights Rápidos</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.recentCompetitor && (
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Último Competidor</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                @{insights.recentCompetitor}
              </div>
              <p className="text-sm text-gray-600">Agregado recientemente</p>
            </div>
          )}
          
          {insights.lastScore !== null && (
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Último Score</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {insights.lastScore}/10
              </div>
              <p className="text-sm text-gray-600">
                {insights.lastScore >= 8 ? 'Excelente rendimiento' : 
                 insights.lastScore >= 6 ? 'Buen resultado' : 'Área de mejora'}
              </p>
            </div>
          )}
          
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Estrategias</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {insights.strategiesCount}
            </div>
            <p className="text-sm text-gray-600">
              {insights.strategiesCount > 0 ? 'Estrategias definidas' : 'Pendiente definir'}
            </p>
          </div>
        </div>
        
        {insights.strategiesCount === 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Recomendación Personalizada
                </h3>
                <p className="text-blue-700 mb-4">
                  Define tu estrategia de contenido para obtener análisis más precisos y recomendaciones personalizadas.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Mejores análisis de competencia</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Contenido más alineado con tu audiencia</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInsights;

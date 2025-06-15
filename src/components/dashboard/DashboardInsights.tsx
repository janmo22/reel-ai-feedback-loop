
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Lightbulb } from "lucide-react";
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
      <Card className="border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights Rápidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.recentCompetitor && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Último competidor:</span>
              </div>
              <Badge variant="outline" className="text-gray-700 border-gray-300">
                @{insights.recentCompetitor}
              </Badge>
            </div>
          )}
          
          {insights.lastScore !== null && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Último score:</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${
                  insights.lastScore >= 8 
                    ? 'text-green-700 border-green-300' 
                    : insights.lastScore >= 6 
                    ? 'text-blue-700 border-blue-300' 
                    : 'text-red-700 border-red-300'
                }`}
              >
                {insights.lastScore}/10
              </Badge>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Estrategias definidas:</span>
            </div>
            <Badge variant="outline" className="text-gray-700 border-gray-300">
              {insights.strategiesCount}
            </Badge>
          </div>
          
          {insights.strategiesCount === 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 Define tu estrategia de contenido para obtener análisis más precisos
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardInsights;

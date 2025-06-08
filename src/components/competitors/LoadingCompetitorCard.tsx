
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Users, Play, MessageCircle, Loader2 } from 'lucide-react';

interface LoadingCompetitorCardProps {
  username: string;
}

const LoadingCompetitorCard: React.FC<LoadingCompetitorCardProps> = ({ username }) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                @{username}
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-600 font-medium">
                  Analizando datos del competidor...
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Extrayendo información</span>
            <span className="text-blue-600 font-medium">En progreso</span>
          </div>
          <Progress value={65} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Users className="h-4 w-4 text-blue-500 mb-1" />
            <Skeleton className="h-4 w-8 mb-1" />
            <span className="text-xs text-muted-foreground">Seguidores</span>
          </div>
          <div className="flex flex-col items-center">
            <Play className="h-4 w-4 text-green-500 mb-1" />
            <Skeleton className="h-4 w-6 mb-1" />
            <span className="text-xs text-muted-foreground">Videos</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="h-4 w-4 text-purple-500 mb-1" />
            <Skeleton className="h-4 w-4 mb-1" />
            <span className="text-xs text-muted-foreground">Analizados</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-700">
            ⏳ Esto puede tardar unos segundos mientras extraemos los datos...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingCompetitorCard;

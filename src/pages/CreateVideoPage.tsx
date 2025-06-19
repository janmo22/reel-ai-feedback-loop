
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Save, Eye, Plus, X, Check, ArrowLeft, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import NewTextEditor from '@/components/text-editor/NewTextEditor';

interface ContentSeries {
  id: string;
  name: string;
  description: string | null;
}

interface SMP {
  id: string;
  text: string;
  completed: boolean;
}

const CreateVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [title, setTitle] = useState('');
  const [mainSMP, setMainSMP] = useState<SMP>({ id: 'main', text: '', completed: false });
  const [secondarySMPs, setSecondarySMPs] = useState<SMP[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [scriptContent, setScriptContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate unique video context ID for this session
  const videoContextId = useMemo(() => {
    return `new-video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []); // Empty dependency array means this will only be generated once per component mount

  // Check if we're editing an existing video
  const editVideoId = searchParams.get('edit');
  const preselectedSeriesId = searchParams.get('series');

  // Fetch content series
  const { data: contentSeries = [] } = useQuery({
    queryKey: ['content-series', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('content_series')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContentSeries[];
    },
    enabled: !!user
  });

  // Set preselected series if provided in URL
  useEffect(() => {
    if (preselectedSeriesId && contentSeries.length > 0) {
      const validSeries = contentSeries.find(series => series.id === preselectedSeriesId);
      if (validSeries) {
        setSelectedSeries(preselectedSeriesId);
      }
    }
  }, [preselectedSeriesId, contentSeries]);

  // Filter out series with invalid IDs
  const validSeries = contentSeries?.filter(series => {
    return series && 
           series.id && 
           typeof series.id === 'string' && 
           series.id.trim() !== '';
  }) || [];

  // Get selected series info
  const selectedSeriesInfo = validSeries.find(series => series.id === selectedSeries);

  const toggleMainSMPCompleted = () => {
    setMainSMP(prev => ({ ...prev, completed: !prev.completed }));
  };

  const updateMainSMPText = (text: string) => {
    setMainSMP(prev => ({ ...prev, text }));
  };

  const addSecondarySMP = () => {
    const newSMP: SMP = {
      id: `secondary-${Date.now()}`,
      text: '',
      completed: false
    };
    setSecondarySMPs([...secondarySMPs, newSMP]);
  };

  const updateSecondarySMP = (id: string, text: string) => {
    setSecondarySMPs(prev => prev.map(smp => 
      smp.id === id ? { ...smp, text } : smp
    ));
  };

  const toggleSecondarySMPCompleted = (id: string) => {
    setSecondarySMPs(prev => prev.map(smp => 
      smp.id === id ? { ...smp, completed: !smp.completed } : smp
    ));
  };

  const removeSecondarySMP = (id: string) => {
    setSecondarySMPs(prev => prev.filter(smp => smp.id !== id));
  };

  const saveVideo = async (isDraft = true) => {
    if (!user || !title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Guardando video:', {
        title: title.trim(),
        mainSMP: mainSMP.text.trim(),
        selectedSeries,
        contentLength: scriptContent.trim().length
      });

      const videoData = {
        user_id: user.id,
        title: title.trim(),
        main_smp: mainSMP.text.trim() || null,
        secondary_smps: secondarySMPs.filter(smp => smp.text.trim() !== '').map(smp => smp.text.trim()),
        hook: null,
        build_up: null,
        value_add: scriptContent.trim() || null,
        call_to_action: null,
        shots: [],
        content_series_id: selectedSeries && selectedSeries !== 'no-series' ? selectedSeries : null,
        script_annotations: {}
      };

      const { data, error } = await supabase
        .from('created_videos')
        .insert(videoData)
        .select()
        .single();

      if (error) {
        console.error('Error al guardar video:', error);
        throw error;
      }

      console.log('Video guardado exitosamente:', data);

      toast({
        title: isDraft ? "Borrador guardado" : "Video guardado",
        description: `Tu ${isDraft ? 'borrador' : 'video'} ha sido guardado correctamente.`,
      });

      // Navigate to videos page to see the saved video
      navigate('/videos');

    } catch (error: any) {
      console.error('Error completo al guardar:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🎬 CreateVideoPage renderizado con contexto:', videoContextId);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Video</h1>
        <p className="text-gray-600">Planifica y estructura tu contenido de manera profesional</p>
      </div>

      <div className="space-y-8">
        {/* Configuración básica */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-flow-blue" />
              Configuración del Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título del Video</Label>
              <Input
                id="title"
                placeholder="Título descriptivo para tu video"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            {validSeries.length > 0 && (
              <div>
                <Label htmlFor="series">Content Series (Opcional)</Label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una serie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-series">Sin serie</SelectItem>
                    {validSeries.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        {series.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Display selected series info */}
                {selectedSeriesInfo && (
                  <div className="mt-2 p-3 bg-flow-blue/5 border border-flow-blue/20 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-4 w-4 text-flow-blue" />
                      <span className="font-medium text-flow-blue">{selectedSeriesInfo.name}</span>
                    </div>
                    {selectedSeriesInfo.description && (
                      <p className="text-sm text-gray-600">{selectedSeriesInfo.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="main-smp">Mensaje Principal (SMP)</Label>
              <Textarea
                id="main-smp"
                placeholder="¿Cuál es el mensaje principal de tu video?"
                value={mainSMP.text}
                onChange={(e) => setMainSMP(prev => ({ ...prev, text: e.target.value }))}
                className="mt-1"
                rows={1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Mensajes Secundarios (SMPs)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSecondarySMP}
                  className="text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar SMP
                </Button>
              </div>
              
              {secondarySMPs.map((smp) => (
                <div key={smp.id} className="flex gap-2 mb-2">
                  <Textarea
                    placeholder="Mensaje secundario"
                    value={smp.text}
                    onChange={(e) => updateSecondarySMP(smp.id, e.target.value)}
                    rows={1}
                    className={`flex-1 ${smp.completed ? 'line-through opacity-60' : ''}`}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant={smp.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSecondarySMPCompleted(smp.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSecondarySMP(smp.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {secondarySMPs.length === 0 && (
                <p className="text-sm text-gray-500">
                  Los SMPs secundarios son mensajes de apoyo que refuerzan tu mensaje principal.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editor de texto principal con contexto único */}
        <NewTextEditor
          onContentChange={setScriptContent}
          videoContextId={videoContextId}
          clearOnMount={true} // Always start clean for new videos
        />

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button 
            onClick={() => saveVideo(true)}
            disabled={isLoading}
            className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Guardando...' : 'Guardar Borrador'}
          </Button>
          <Button 
            onClick={() => saveVideo(false)}
            disabled={isLoading}
            variant="outline" 
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Guardar Video
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;

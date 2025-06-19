
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
  const editVideoId = searchParams.get('edit');
  const isEditing = Boolean(editVideoId);
  
  const [title, setTitle] = useState('');
  const [mainSMP, setMainSMP] = useState<SMP>({ id: 'main', text: '', completed: false });
  const [secondarySMPs, setSecondarySMPs] = useState<SMP[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [scriptContent, setScriptContent] = useState('');
  const [editorSections, setEditorSections] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate unique video context ID for this session
  const videoContextId = useMemo(() => {
    if (isEditing && editVideoId) {
      return `edit-video-${editVideoId}`;
    }
    return `new-video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [isEditing, editVideoId]);

  // Fetch video data for editing
  const { data: videoData, isLoading: isLoadingVideo } = useQuery({
    queryKey: ['video-data', editVideoId],
    queryFn: async () => {
      if (!editVideoId || !user) return null;
      const { data, error } = await supabase
        .from('created_videos')
        .select(`
          *,
          content_series (
            id,
            name
          )
        `)
        .eq('id', editVideoId)
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: Boolean(editVideoId && user)
  });

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

  // Load video data when editing
  useEffect(() => {
    if (isEditing && videoData && !isDataLoaded) {
      console.log('Cargando datos del video para edición:', videoData);
      
      setTitle(videoData.title || '');
      setMainSMP({ 
        id: 'main', 
        text: videoData.main_smp || '', 
        completed: false 
      });
      
      if (videoData.secondary_smps && Array.isArray(videoData.secondary_smps)) {
        const smps = videoData.secondary_smps.map((text: string, index: number) => ({
          id: `secondary-${index}`,
          text,
          completed: false
        }));
        setSecondarySMPs(smps);
      }
      
      if (videoData.content_series_id) {
        setSelectedSeries(videoData.content_series_id);
      }
      
      setIsDataLoaded(true);
    }
  }, [isEditing, videoData, isDataLoaded]);

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

  // Handler to receive structured content from the editor
  const handleEditorContentChange = (content: string, sections: any[]) => {
    setScriptContent(content);
    setEditorSections(sections);
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

    try {
      // Extract content from sections
      const hookContent = editorSections.find(s => s.id === 'hook')?.content || '';
      const buildupContent = editorSections.find(s => s.id === 'buildup')?.content || '';
      const valueContent = editorSections.find(s => s.id === 'value')?.content || '';
      const ctaContent = editorSections.find(s => s.id === 'cta')?.content || '';

      // Collect all shots from all sections
      const allShots: any[] = [];
      editorSections.forEach(section => {
        if (section.shots && Array.isArray(section.shots)) {
          section.shots.forEach((shot: any) => {
            // Avoid duplicates by checking if shot already exists
            const existingShot = allShots.find(s => s.id === shot.id);
            if (!existingShot) {
              allShots.push(shot);
            }
          });
        }
      });

      const videoData = {
        user_id: user.id,
        title: title.trim(),
        main_smp: mainSMP.text.trim() || null,
        secondary_smps: secondarySMPs.filter(smp => smp.text.trim() !== '').map(smp => smp.text),
        hook: hookContent.trim() || null,
        build_up: buildupContent.trim() || null,
        value_add: valueContent.trim() || null,
        call_to_action: ctaContent.trim() || null,
        shots: allShots,
        content_series_id: selectedSeries === 'no-series' ? null : selectedSeries || null,
        script_annotations: {
          videoContextId,
          editorMode: 'structured',
          sectionsData: editorSections
        }
      };

      console.log('Guardando video con datos:', videoData);

      let error;
      if (isEditing && editVideoId) {
        // Update existing video
        const result = await supabase
          .from('created_videos')
          .update(videoData)
          .eq('id', editVideoId)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        // Create new video
        const result = await supabase
          .from('created_videos')
          .insert(videoData);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Video actualizado" : (isDraft ? "Borrador guardado" : "Video guardado"),
        description: `Tu ${isDraft ? 'borrador' : 'video'} ha sido ${isEditing ? 'actualizado' : 'guardado'} correctamente.`,
      });

      // Navigate back to videos page
      navigate('/videos');

    } catch (error: any) {
      console.error('Error guardando video:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isEditing && isLoadingVideo) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flow-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando video...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🎬 CreateVideoPage renderizado:', { 
    isEditing, 
    videoContextId, 
    isDataLoaded,
    title,
    editVideoId 
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/videos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Editar Video' : 'Crear Nuevo Video'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Modifica tu contenido de manera profesional' : 'Planifica y estructura tu contenido de manera profesional'}
        </p>
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
                onChange={(e) => updateMainSMPText(e.target.value)}
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
          onContentChange={handleEditorContentChange}
          videoContextId={videoContextId}
          clearOnMount={!isEditing} // Solo limpiar para videos nuevos
          initialData={isEditing && videoData ? {
            hook: videoData.hook || '',
            build_up: videoData.build_up || '',
            value_add: videoData.value_add || '',
            call_to_action: videoData.call_to_action || '',
            shots: videoData.shots || []
          } : undefined}
        />

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button 
            onClick={() => saveVideo(true)}
            className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Actualizar Borrador' : 'Guardar Borrador'}
          </Button>
          <Button 
            onClick={() => saveVideo(false)}
            variant="outline" 
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isEditing ? 'Actualizar Video' : 'Guardar Video'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;

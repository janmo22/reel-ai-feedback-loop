import React, { useState, useEffect } from 'react';
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
import NotionStyleEditor from '@/components/text-editor/NotionStyleEditor';

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
  
  // Initialize with URL params if available
  const initialSeriesId = searchParams.get('series') || '';
  
  const [title, setTitle] = useState('');
  const [mainSMP, setMainSMP] = useState<SMP>({ id: 'main', text: '', completed: false });
  const [secondarySMPs, setSecondarySMPs] = useState<SMP[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>(initialSeriesId);
  const [scriptContent, setScriptContent] = useState('');
  const [editorKey, setEditorKey] = useState(0); // Force re-render of editor

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

  // Filter out series with invalid IDs
  const validSeries = contentSeries?.filter(series => {
    return series && 
           series.id && 
           typeof series.id === 'string' && 
           series.id.trim() !== '';
  }) || [];

  // Get selected series info
  const selectedSeriesInfo = validSeries.find(series => series.id === selectedSeries);

  // Clear form when component mounts or when navigating from different routes
  useEffect(() => {
    // Only set initial series if it's valid and exists
    const seriesParam = searchParams.get('series');
    if (seriesParam && validSeries.some(series => series.id === seriesParam)) {
      setSelectedSeries(seriesParam);
    } else {
      setSelectedSeries('');
    }
  }, [searchParams, validSeries]);

  const resetForm = () => {
    setTitle('');
    setMainSMP({ id: 'main', text: '', completed: false });
    setSecondarySMPs([]);
    setSelectedSeries('');
    setScriptContent('');
    setEditorKey(prev => prev + 1); // Force editor reset
  };

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

    try {
      console.log('Saving video with series:', selectedSeries);
      
      const { error } = await supabase
        .from('created_videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          main_smp: mainSMP.text.trim() || null,
          secondary_smps: secondarySMPs.filter(smp => smp.text.trim() !== '').map(smp => smp.text),
          hook: null,
          build_up: null,
          value_add: scriptContent.trim() || null,
          call_to_action: null,
          shots: [],
          content_series_id: selectedSeries === 'no-series' || selectedSeries === '' ? null : selectedSeries,
          script_annotations: {}
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      toast({
        title: isDraft ? "Borrador guardado" : "Video guardado",
        description: `Tu ${isDraft ? 'borrador' : 'video'} ha sido guardado correctamente.`,
      });

      // Reset form after successful save
      resetForm();

    } catch (error: any) {
      console.error('Error saving video:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSeriesChange = (value: string) => {
    console.log('Series changed to:', value);
    setSelectedSeries(value);
  };

  const handleEditorContentChange = (content: string) => {
    setScriptContent(content);
  };

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
                <Select value={selectedSeries} onValueChange={handleSeriesChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona una serie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-series">Sin serie específica</SelectItem>
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

        {/* Editor de texto principal */}
        <NotionStyleEditor
          key={editorKey}
          onContentChange={handleEditorContentChange}
          initialContent=""
        />

        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button 
            onClick={() => saveVideo(true)}
            className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button 
            onClick={() => saveVideo(false)}
            variant="outline" 
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Guardar Video
          </Button>
          <Button 
            onClick={resetForm}
            variant="outline" 
            className="px-6"
          >
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;

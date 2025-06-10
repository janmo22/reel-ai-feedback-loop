
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Camera, FileText, Megaphone, X, Save, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface ContentSeries {
  id: string;
  name: string;
  description: string | null;
}

interface UserShot {
  id: string;
  name: string;
  description: string | null;
}

const CreateVideoPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [mainSMP, setMainSMP] = useState('');
  const [smps, setSMPs] = useState<string[]>(['']);
  const [hook, setHook] = useState('');
  const [buildUp, setBuildUp] = useState('');
  const [valueAdd, setValueAdd] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [shots, setShots] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [scriptAnnotations, setScriptAnnotations] = useState({});

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

  // Fetch user shots
  const { data: userShots = [] } = useQuery({
    queryKey: ['user-shots', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_shots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserShot[];
    },
    enabled: !!user
  });

  const addSMP = () => {
    setSMPs([...smps, '']);
  };

  const updateSMP = (index: number, value: string) => {
    const newSMPs = [...smps];
    newSMPs[index] = value;
    setSMPs(newSMPs);
  };

  const removeSMP = (index: number) => {
    setSMPs(smps.filter((_, i) => i !== index));
  };

  const addShot = () => {
    setShots([...shots, '']);
  };

  const updateShot = (index: number, value: string) => {
    const newShots = [...shots];
    newShots[index] = value;
    setShots(newShots);
  };

  const removeShot = (index: number) => {
    setShots(shots.filter((_, i) => i !== index));
  };

  const addUserShot = (shot: UserShot) => {
    setShots([...shots, shot.name]);
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
      const { error } = await supabase
        .from('created_videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          main_smp: mainSMP.trim() || null,
          secondary_smps: smps.filter(smp => smp.trim() !== ''),
          hook: hook.trim() || null,
          build_up: buildUp.trim() || null,
          value_add: valueAdd.trim() || null,
          call_to_action: callToAction.trim() || null,
          shots: shots.filter(shot => shot.trim() !== ''),
          content_series_id: selectedSeries || null,
          script_annotations: scriptAnnotations
        });

      if (error) throw error;

      toast({
        title: isDraft ? "Borrador guardado" : "Video guardado",
        description: `Tu ${isDraft ? 'borrador' : 'video'} ha sido guardado correctamente.`,
      });

      // Reset form
      setTitle('');
      setMainSMP('');
      setSMPs(['']);
      setHook('');
      setBuildUp('');
      setValueAdd('');
      setCallToAction('');
      setShots([]);
      setSelectedSeries('');
      setScriptAnnotations({});

    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const predefinedShots = [
    'Plano general',
    'Plano medio', 
    'Primer plano',
    'Plano detalle',
    'Plano cenital',
    'Contrapicado',
    'Picado',
    'Travelling',
    'Zoom in',
    'Zoom out'
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Video</h1>
        <p className="text-gray-600">Planifica y estructura tu contenido de manera profesional</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sección de SMPs */}
        <div className="space-y-6">
          <Card>
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

              {contentSeries.length > 0 && (
                <div>
                  <Label htmlFor="series">Content Series (Opcional)</Label>
                  <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona una serie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin serie</SelectItem>
                      {contentSeries.map((series) => (
                        <SelectItem key={series.id} value={series.id}>
                          {series.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="main-smp">SMP Principal</Label>
                <Textarea
                  id="main-smp"
                  placeholder="¿Cuál es el mensaje principal de tu video?"
                  value={mainSMP}
                  onChange={(e) => setMainSMP(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>SMPs Secundarios</Label>
                  <Button onClick={addSMP} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar SMP
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {smps.map((smp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`SMP ${index + 1}: Punto específico a cubrir`}
                        value={smp}
                        onChange={(e) => updateSMP(index, e.target.value)}
                        className="flex-1"
                      />
                      {smps.length > 1 && (
                        <Button
                          onClick={() => removeSMP(index)}
                          variant="outline"
                          size="icon"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Planos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-flow-blue" />
                Planos y Tomas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Planos Predefinidos</Label>
                <Button onClick={addShot} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Plano Personalizado
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {predefinedShots.map((shot, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-flow-blue hover:text-white transition-colors"
                    onClick={() => setShots([...shots, shot])}
                  >
                    {shot}
                  </Badge>
                ))}
              </div>

              {userShots.length > 0 && (
                <div>
                  <Label>Tus Planos Guardados</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userShots.map((shot) => (
                      <Badge
                        key={shot.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => addUserShot(shot)}
                      >
                        {shot.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {shots.length > 0 && (
                <div className="space-y-2">
                  <Label>Planos Seleccionados</Label>
                  <div className="space-y-2">
                    {shots.map((shot, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={shot}
                          onChange={(e) => updateShot(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeShot(index)}
                          variant="outline"
                          size="icon"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sección Creativa */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-flow-blue" />
                Lienzo Creativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hook */}
              <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                <Label className="text-red-700 font-semibold mb-2 block">
                  🎯 Hook (Ruptura de Patrón)
                </Label>
                <Textarea
                  placeholder="¿Cómo vas a captar la atención en los primeros 3 segundos? Crea una ruptura de patrón..."
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                />
              </div>

              {/* Build-up */}
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                <Label className="text-yellow-700 font-semibold mb-2 block">
                  🔨 Build-up (El Problema)
                </Label>
                <Textarea
                  placeholder="Explica el problema que tu video va a solucionar. Genera tensión y necesidad..."
                  value={buildUp}
                  onChange={(e) => setBuildUp(e.target.value)}
                  rows={3}
                  className="border-yellow-200 focus:border-yellow-400"
                />
              </div>

              {/* Aporte de Valor */}
              <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                <Label className="text-green-700 font-semibold mb-2 block">
                  💎 Aporte de Valor (La Solución)
                </Label>
                <Textarea
                  placeholder="Aquí va todo tu contenido de valor. La solución completa al problema planteado..."
                  value={valueAdd}
                  onChange={(e) => setValueAdd(e.target.value)}
                  rows={4}
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              {/* Call to Action */}
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <Label className="text-blue-700 font-semibold mb-2 block">
                  📢 Call to Action
                </Label>
                <Textarea
                  placeholder="¿Qué quieres que haga tu audiencia? Proporciona valor en tu CTA..."
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  rows={3}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;

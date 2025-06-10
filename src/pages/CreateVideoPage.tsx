
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Target, Camera, FileText, Megaphone, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CreateVideoPage: React.FC = () => {
  const [mainSMP, setMainSMP] = useState('');
  const [smps, setSMPs] = useState<string[]>(['']);
  const [hook, setHook] = useState('');
  const [buildUp, setBuildUp] = useState('');
  const [valueAdd, setValueAdd] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [shots, setShots] = useState<string[]>([]);

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
                Mensaje Principal (SMP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            <Button className="flex-1 bg-flow-blue hover:bg-flow-blue/90">
              Guardar Borrador
            </Button>
            <Button variant="outline" className="flex-1">
              Vista Previa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoPage;
